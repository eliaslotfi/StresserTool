import asyncio
import json
import math
import random
import uuid
from collections import deque, defaultdict
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import aiohttp
from aiohttp_socks import ProxyConnector
import numpy as np
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field
import aiosqlite
import os
from collections import defaultdict
from collections import deque as _deque


app = FastAPI(title="Stress Test Lab - Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# MODELS
# -------------------------
class TestRequest(BaseModel):
    url: str
    duration: int  # seconds
    concurrency: int
    proxies: List[str] = Field(default_factory=list)  # optional HTTP/SOCKS5 proxies


class TestSummary(BaseModel):
    test_id: str
    started_at: str
    finished_at: Optional[str]
    requests_sent: int
    errors: int
    rps: float
    latency_ms: Dict[str, float]
    duration_s: int


# -------------------------
# STATE
# -------------------------
class WebSocketHub:
    def __init__(self) -> None:
        self._test_id_to_ws: Dict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, test_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._test_id_to_ws[test_id].append(websocket)

    def disconnect(self, test_id: str, websocket: WebSocket) -> None:
        if test_id in self._test_id_to_ws and websocket in self._test_id_to_ws[test_id]:
            self._test_id_to_ws[test_id].remove(websocket)

    async def broadcast(self, test_id: str, message: Dict[str, Any]) -> None:
        dead: List[WebSocket] = []
        for ws in list(self._test_id_to_ws.get(test_id, [])):
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(test_id, ws)


ws_hub = WebSocketHub()


class TestState:
    def __init__(self, req: TestRequest) -> None:
        self.req = req
        self.test_id = str(uuid.uuid4())
        self.started_at = datetime.utcnow()
        self.finished_at: Optional[datetime] = None
        self.cancel_event = asyncio.Event()
        self.total_success = 0
        self.total_errors = 0
        self.latencies: List[float] = []  # seconds
        self.per_second_counts: deque[tuple[int, int, int]] = deque(maxlen=3600)  # (epoch_sec, success, errors)
        self._lock = asyncio.Lock()
        self._task: Optional[asyncio.Task] = None

    def start(self, task: asyncio.Task) -> None:
        self._task = task

    async def stop(self) -> None:
        self.cancel_event.set()
        t = self._task
        if t is not None:
            with contextlib.suppress(Exception):
                await t

    def to_summary(self) -> TestSummary:
        duration = self.req.duration
        rps = (self.total_success / max(duration, 1)) if self.finished_at else 0.0
        p50 = float(np.percentile(self.latencies, 50) * 1000) if self.latencies else 0.0
        p95 = float(np.percentile(self.latencies, 95) * 1000) if self.latencies else 0.0
        p99 = float(np.percentile(self.latencies, 99) * 1000) if self.latencies else 0.0
        return TestSummary(
            test_id=self.test_id,
            started_at=self.started_at.isoformat() + "Z",
            finished_at=self.finished_at.isoformat() + "Z" if self.finished_at else None,
            requests_sent=self.total_success,
            errors=self.total_errors,
            rps=rps,
            latency_ms={"p50": p50, "p95": p95, "p99": p99},
            duration_s=self.req.duration,
        )


tests: Dict[str, TestState] = {}


# -------------------------
# HELPERS
# -------------------------
import contextlib
import ipaddress

# -------------------------
# CONFIG / SECURITY
# -------------------------
API_KEY = os.getenv("STRESS_API_KEY", "BrockLesnar77")
ALLOWED_IPS = {ip.strip() for ip in os.getenv("STRESS_ALLOWED_IPS", "").split(",") if ip.strip()}
GLOBAL_KILL_SWITCH = {"enabled": False}
MAX_CONCURRENCY = 1000
MAX_DURATION = 3600

# Simple anti-bruteforce rate limit: max 5 auth attempts per IP per 60s
RATE_WINDOW_SECONDS = 60
RATE_LIMIT_MAX = 5
_rate_buckets: dict[str, _deque] = defaultdict(_deque)


def _rate_limit_check(ip: str) -> None:
    if not ip:
        return
    dq = _rate_buckets[ip]
    now = datetime.utcnow().timestamp()
    # drop old entries
    while dq and (now - dq[0]) > RATE_WINDOW_SECONDS:
        dq.popleft()
    dq.append(now)
    if len(dq) > RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Too Many Requests")


async def require_auth(request: Request) -> None:
    # IP allowlist (supports single IP and CIDR)
    client_ip = request.client.host if request.client else ""
    # Rate limit before auth check
    _rate_limit_check(client_ip)
    # If allowlist is empty, allow all IPs
    if ALLOWED_IPS:
        try:
            if not any(
                (ip == client_ip) or ("/" in ip and ipaddress.ip_address(client_ip) in ipaddress.ip_network(ip, strict=False))
                for ip in ALLOWED_IPS
            ):
                raise HTTPException(status_code=403, detail="IP not allowed")
        except Exception:
            raise HTTPException(status_code=403, detail="IP not allowed")

    # API key via header
    auth = request.headers.get("x-api-key") or request.headers.get("authorization", "").replace("Bearer ", "")
    if not auth or auth != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    # Global kill switch
    if GLOBAL_KILL_SWITCH["enabled"]:
        raise HTTPException(status_code=503, detail="Service temporarily disabled")


def split_proxies(proxies: List[str]) -> tuple[List[str], List[str]]:
    http_like: List[str] = []
    socks_like: List[str] = []
    for p in proxies:
        pl = p.lower()
        if pl.startswith("http://") or pl.startswith("https://"):
            http_like.append(p)
        elif pl.startswith("socks5://") or pl.startswith("socks4://"):
            socks_like.append(p)
    return http_like, socks_like


def validate_proxy_list(proxies: List[str]) -> None:
    for p in proxies:
        pl = p.lower()
        if not (
            pl.startswith("http://")
            or pl.startswith("https://")
            or pl.startswith("socks5://")
            or pl.startswith("socks4://")
        ):
            raise HTTPException(status_code=400, detail=f"Unsupported proxy scheme: {p}")


async def fetch_once(session: aiohttp.ClientSession, url: str, proxy: Optional[str], latencies: List[float]) -> bool:
    start = asyncio.get_event_loop().time()
    try:
        async with session.get(url, proxy=proxy) as resp:
            await resp.read()  # ensure body consumed
        latency = asyncio.get_event_loop().time() - start
        latencies.append(latency)
        return True
    except Exception:
        return False


async def run_test_worker(state: TestState) -> None:
    req = state.req
    http_proxies, socks_proxies = split_proxies(req.proxies)

    timeout = aiohttp.ClientTimeout(total=None, sock_connect=5, sock_read=5)
    base_connector = aiohttp.TCPConnector(limit=0, force_close=False, keepalive_timeout=30)

    # Sessions:
    sessions: List[aiohttp.ClientSession] = []
    socks_sessions: List[aiohttp.ClientSession] = []

    try:
        sessions.append(aiohttp.ClientSession(connector=base_connector, timeout=timeout))
        for sp in socks_proxies:
            socks_sessions.append(
                aiohttp.ClientSession(connector=ProxyConnector.from_url(sp), timeout=timeout)
            )

        sem = asyncio.Semaphore(req.concurrency)
        start_time = asyncio.get_event_loop().time()
        end_wall = state.started_at + timedelta(seconds=req.duration)

        async def one_loop() -> None:
            nonlocal start_time
            http_index = 0
            socks_index = 0
            while datetime.utcnow() < end_wall and not state.cancel_event.is_set():
                async with sem:
                    # choose session and proxy
                    if socks_sessions:
                        session = socks_sessions[socks_index % len(socks_sessions)]
                        socks_index += 1
                        proxy = None  # proxy handled by connector
                    else:
                        session = sessions[0]
                        proxy = None
                        if http_proxies:
                            proxy = http_proxies[http_index % len(http_proxies)]
                            http_index += 1

                    ok = await fetch_once(session, req.url, proxy, state.latencies)

                    # update counters per second bucket
                    epoch_sec = int(asyncio.get_event_loop().time())
                    success_inc = 1 if ok else 0
                    error_inc = 0 if ok else 1
                    async with state._lock:
                        state.total_success += success_inc
                        state.total_errors += error_inc
                        if state.per_second_counts and state.per_second_counts[-1][0] == epoch_sec:
                            ts, sc, er = state.per_second_counts[-1]
                            state.per_second_counts[-1] = (ts, sc + success_inc, er + error_inc)
                        else:
                            state.per_second_counts.append((epoch_sec, success_inc, error_inc))

                await asyncio.sleep(0)  # yield

        workers = [asyncio.create_task(one_loop()) for _ in range(req.concurrency)]

        # Ticker to broadcast live metrics
        async def ticker() -> None:
            while datetime.utcnow() < end_wall and not state.cancel_event.is_set():
                await asyncio.sleep(1)
                async with state._lock:
                    rps = 0
                    if state.per_second_counts:
                        last_ts, last_s, _ = state.per_second_counts[-1]
                        rps = last_s
                    await ws_hub.broadcast(
                        state.test_id,
                        {
                            "type": "progress",
                            "test_id": state.test_id,
                            "elapsed_s": int((datetime.utcnow() - state.started_at).total_seconds()),
                            "requests_sent": state.total_success,
                            "errors": state.total_errors,
                            "rps": rps,
                        },
                    )
                    # persist per-second metric
                    try:
                        if getattr(app.state, "db", None) is not None and state.per_second_counts:
                            ts, s, e = state.per_second_counts[-1]
                            await app.state.db.execute(
                                "INSERT OR REPLACE INTO metrics(test_id, epoch_sec, success, errors) VALUES(?,?,?,?)",
                                (state.test_id, ts, s, e),
                            )
                            await app.state.db.commit()
                    except Exception:
                        pass

        ticker_task = asyncio.create_task(ticker())
        await asyncio.gather(*workers)
        ticker_task.cancel()
        with contextlib.suppress(Exception):
            await ticker_task

    finally:
        state.finished_at = datetime.utcnow()
        # close sessions
        for s in socks_sessions:
            with contextlib.suppress(Exception):
                await s.close()
        for s in sessions:
            with contextlib.suppress(Exception):
                await s.close()

        # final broadcast
        summary = state.to_summary().dict()
        summary.update({"type": "final"})
        await ws_hub.broadcast(state.test_id, summary)
        # persist final summary
        try:
            if getattr(app.state, "db", None) is not None:
                proxies_json = json.dumps(state.req.proxies)
                await app.state.db.execute(
                    (
                        "INSERT OR REPLACE INTO tests("
                        " test_id, url, duration, concurrency, proxies_json, started_at, finished_at,"
                        " requests_sent, errors, rps, p50_ms, p95_ms, p99_ms"
                        ") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
                    ),
                    (
                        state.test_id,
                        state.req.url,
                        state.req.duration,
                        state.req.concurrency,
                        proxies_json,
                        state.started_at.isoformat() + "Z",
                        state.finished_at.isoformat() + "Z" if state.finished_at else None,
                        summary["requests_sent"],
                        summary["errors"],
                        summary["rps"],
                        summary["latency_ms"]["p50"],
                        summary["latency_ms"]["p95"],
                        summary["latency_ms"]["p99"],
                    ),
                )
                await app.state.db.commit()
        except Exception:
            pass


# -------------------------
# ROUTES
# -------------------------
@app.get("/")
def index():
    return {"message": "Stress Test Lab Backend - Use POST /tests to start, WS /ws/tests/{id}"}


# -------------------------
# DB LIFECYCLE
# -------------------------
@app.on_event("startup")
async def on_startup() -> None:
    db_path = os.getenv("STRESS_DB_PATH", "stresslab.db")
    app.state.db = await aiosqlite.connect(db_path)
    await app.state.db.execute(
        (
            "CREATE TABLE IF NOT EXISTS tests ("
            " test_id TEXT PRIMARY KEY,"
            " url TEXT NOT NULL,"
            " duration INTEGER NOT NULL,"
            " concurrency INTEGER NOT NULL,"
            " proxies_json TEXT,"
            " started_at TEXT,"
            " finished_at TEXT,"
            " requests_sent INTEGER,"
            " errors INTEGER,"
            " rps REAL,"
            " p50_ms REAL,"
            " p95_ms REAL,"
            " p99_ms REAL"
            ")"
        )
    )
    await app.state.db.execute(
        (
            "CREATE TABLE IF NOT EXISTS metrics ("
            " test_id TEXT,"
            " epoch_sec INTEGER,"
            " success INTEGER,"
            " errors INTEGER,"
            " PRIMARY KEY(test_id, epoch_sec)"
            ")"
        )
    )
    await app.state.db.commit()


@app.on_event("shutdown")
async def on_shutdown() -> None:
    if getattr(app.state, "db", None) is not None:
        try:
            await app.state.db.close()
        except Exception:
            pass


@app.post("/run_test")
async def run_test_compat(request: TestRequest, _: None = Depends(require_auth)):
    # Backward-compatible single-run endpoint returning only final metrics
    validate_request(request)
    state = TestState(request)
    task = asyncio.create_task(run_test_worker(state))
    state.start(task)
    await task
    return state.to_summary().dict()


def validate_request(request: TestRequest) -> None:
    if not request.url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="URL must start with http:// or https://")
    if request.concurrency < 1 or request.concurrency > MAX_CONCURRENCY:
        raise HTTPException(status_code=400, detail=f"Concurrency must be between 1 and {MAX_CONCURRENCY}")
    if request.duration < 5 or request.duration > MAX_DURATION:
        raise HTTPException(status_code=400, detail=f"Duration must be between 5 and {MAX_DURATION} seconds")
    validate_proxy_list(request.proxies)


@app.post("/tests")
async def start_test(request: TestRequest, _: None = Depends(require_auth)):
    validate_request(request)
    state = TestState(request)
    tests[state.test_id] = state
    task = asyncio.create_task(run_test_worker(state))
    state.start(task)
    return {"test_id": state.test_id, "started_at": state.started_at.isoformat() + "Z"}


@app.get("/tests/{test_id}")
async def get_test_status(test_id: str, _: None = Depends(require_auth)):
    state = tests.get(test_id)
    if not state:
        raise HTTPException(status_code=404, detail="Test not found")
    return state.to_summary()


@app.post("/tests/{test_id}/cancel")
async def cancel_test(test_id: str, _: None = Depends(require_auth)):
    state = tests.get(test_id)
    if not state:
        raise HTTPException(status_code=404, detail="Test not found")
    await state.stop()
    return {"status": "cancelling"}


@app.get("/tests/{test_id}/report")
async def get_report(test_id: str, format: str = "json", _: None = Depends(require_auth)):
    state = tests.get(test_id)
    if not state:
        raise HTTPException(status_code=404, detail="Test not found")
    summary = state.to_summary().dict()
    if format == "json":
        return JSONResponse(content=summary)
    if format == "csv":
        # Simple one-line CSV summary
        headers = [
            "test_id",
            "started_at",
            "finished_at",
            "requests_sent",
            "errors",
            "rps",
            "p50_ms",
            "p95_ms",
            "p99_ms",
            "duration_s",
        ]
        row = [
            summary["test_id"],
            summary["started_at"],
            summary.get("finished_at") or "",
            str(summary["requests_sent"]),
            str(summary["errors"]),
            f"{summary['rps']:.2f}",
            f"{summary['latency_ms']['p50']:.2f}",
            f"{summary['latency_ms']['p95']:.2f}",
            f"{summary['latency_ms']['p99']:.2f}",
            str(summary["duration_s"]),
        ]
        csv_data = ",".join(headers) + "\n" + ",".join(row) + "\n"
        return PlainTextResponse(csv_data, media_type="text/csv")
    raise HTTPException(status_code=400, detail="Unsupported format. Use json or csv")


@app.websocket("/ws/tests/{test_id}")
async def ws_test_progress(websocket: WebSocket, test_id: str):
    state = tests.get(test_id)
    if not state:
        await websocket.close(code=4404)
        return
    # Simple query param api key check for WS
    try:
        token = websocket.query_params.get("key")
        if API_KEY and token != API_KEY:
            await websocket.close(code=4401)
            return
    except Exception:
        await websocket.close(code=4401)
        return
    await ws_hub.connect(test_id, websocket)
    # Send initial snapshot
    await websocket.send_text(json.dumps({"type": "hello", "test_id": test_id}))
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_hub.disconnect(test_id, websocket)


# -------------------------
# HISTORY & ADMIN ENDPOINTS
# -------------------------
@app.get("/history")
async def get_history(limit: int = 50, _: None = Depends(require_auth)):
    if getattr(app.state, "db", None) is None:
        return []
    cur = await app.state.db.execute(
        "SELECT test_id, url, duration, concurrency, proxies_json, started_at, finished_at, requests_sent, errors, rps, p50_ms, p95_ms, p99_ms FROM tests ORDER BY started_at DESC LIMIT ?",
        (limit,),
    )
    rows = await cur.fetchall()
    await cur.close()
    return [
        {
            "test_id": r[0],
            "url": r[1],
            "duration": r[2],
            "concurrency": r[3],
            "proxies": json.loads(r[4] or "[]"),
            "started_at": r[5],
            "finished_at": r[6],
            "requests_sent": r[7],
            "errors": r[8],
            "rps": r[9],
            "latency_ms": {"p50": r[10], "p95": r[11], "p99": r[12]},
        }
        for r in rows
    ]


@app.get("/history/{test_id}")
async def get_history_detail(test_id: str, _: None = Depends(require_auth)):
    if getattr(app.state, "db", None) is None:
        raise HTTPException(status_code=404, detail="No DB")
    cur = await app.state.db.execute(
        "SELECT test_id, url, duration, concurrency, proxies_json, started_at, finished_at, requests_sent, errors, rps, p50_ms, p95_ms, p99_ms FROM tests WHERE test_id = ?",
        (test_id,),
    )
    row = await cur.fetchone()
    await cur.close()
    if not row:
        raise HTTPException(status_code=404, detail="Test not found")
    cur2 = await app.state.db.execute(
        "SELECT epoch_sec, success, errors FROM metrics WHERE test_id = ? ORDER BY epoch_sec",
        (test_id,),
    )
    mrows = await cur2.fetchall()
    await cur2.close()
    return {
        "test_id": row[0],
        "url": row[1],
        "duration": row[2],
        "concurrency": row[3],
        "proxies": json.loads(row[4] or "[]"),
        "started_at": row[5],
        "finished_at": row[6],
        "requests_sent": row[7],
        "errors": row[8],
        "rps": row[9],
        "latency_ms": {"p50": row[10], "p95": row[11], "p99": row[12]},
        "per_second": [
            {"epoch_sec": r[0], "success": r[1], "errors": r[2]} for r in mrows
        ],
    }


@app.post("/admin/kill_switch")
async def set_kill_switch(enabled: bool, _: None = Depends(require_auth)):
    GLOBAL_KILL_SWITCH["enabled"] = bool(enabled)
    return {"kill_switch": GLOBAL_KILL_SWITCH["enabled"]}
