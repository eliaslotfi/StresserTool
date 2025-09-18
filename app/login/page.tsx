"use client";
import { LoginForm } from "@/components/login-form";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { login } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-primary">{">"} LOGIN</h1>
        <LoginForm onLogin={login} />
      </Card>
    </div>
  );
}
