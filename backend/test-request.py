import requests

# URL du backend FastAPI
url = "http://localhost:8000/run_test"

# Payload pour tester un serveur local
payload = {
    "url": "http://127.0.0.1:8080",
    "duration": 10,
    "concurrency": 5,
    "proxies": []
}


try:
    response = requests.post(url, json=payload, timeout=15)  # timeout 15s
    print(response.json())
except requests.exceptions.RequestException as e:
    print(f"[!] Erreur lors de l'envoi de la requête : {e}")
