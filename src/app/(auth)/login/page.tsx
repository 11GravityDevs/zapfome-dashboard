"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { useToast } from "@/contexts/toast-context";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        showToast({ variant: "error", title: "E-mail ou senha incorretos." });
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      showToast({ variant: "error", title: "Não foi possível conectar. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-(--spacing-md)">
      <div className="flex w-full max-w-[440px] flex-col items-center">
        <Logo imageSize={80} fontSize={24} />

        <div className="mt-(--spacing-xl) w-full rounded-xl bg-bg-card p-(--spacing-xl) shadow-card">
          <h1 className="text-center text-lg font-semibold text-font-primary">Acesse seu painel</h1>

          <form
            onSubmit={handleSubmit}
            className="mt-(--spacing-lg) flex flex-col gap-(--spacing-md)"
          >
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              required
              maxLength={128}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <Button type="submit" fullWidth loading={loading} className="mt-(--spacing-md)">
              Entrar
            </Button>
          </form>

          <p className="mt-(--spacing-lg) text-center text-xs font-normal text-font-secondary">
            Zapfome &copy; 2026
          </p>
        </div>
      </div>
    </div>
  );
}
