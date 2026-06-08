import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AuthHero } from "../components/shared/auth/AuthHero";
import { AuthInput } from "../components/shared/auth/AuthInput";
import { GoogleButton } from "../components/shared/auth/GoogleButton";
import { signInWithEmail, signInWithGoogle, resetPassword } from "../services/authService";

import welcomeHero from "../assets/welcome.webp";

/**
 * LoginPage — Tela de login da Alumia.
 * Oferece autenticação por email/senha ou Google OAuth.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail({ email, password });
      navigate({ to: "/" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao entrar com Google.");
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError("Digite seu email acima para redefinir a senha.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#ebf4f8]">
      {/* Hero image */}
      <AuthHero src={welcomeHero} alt="Personagem acenando na porta de entrada" />

      {/* Form container */}
      <div className="mx-auto w-full max-w-md flex-1 px-6 pb-10 pt-6 flex flex-col justify-between">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-tight text-[#1a2530]">
            A casa é sua. Entre e fique à vontade.
          </h1>
          <p className="mt-2 text-sm text-[#8a99a8]">
            Você chegou. Agora é hora de cuidar do que importa: você.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <AuthInput
              id="login-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              autoFocus
            />
            <AuthInput
              id="login-password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />

            {/* Error / success feedback */}
            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-xs text-destructive">
                {error}
              </p>
            )}
            {resetSent && (
              <p className="rounded-xl bg-tone-mint px-4 py-3 text-xs text-tone-mint-fg">
                Email de recuperação enviado! Verifique sua caixa de entrada.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full rounded-2xl bg-[#cde2f2] py-4 text-base font-bold text-[#2a405a] shadow-[0_4px_12px_rgba(44,64,90,0.08)] hover:bg-[#bed5e8] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          {/* Reset password */}
          <div className="mt-4 text-center text-sm text-[#8a99a8]">
            Esqueceu?{" "}
            <button
              type="button"
              onClick={handleReset}
              className="font-bold text-[#5d85a6] hover:underline"
            >
              Resete sua senha
            </button>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#d5e3ef]" />
            <span className="text-xs font-bold text-[#8a99a8] tracking-wider">OU</span>
            <div className="h-px flex-1 bg-[#d5e3ef]" />
          </div>

          <GoogleButton label="Entrar com o Google" onClick={handleGoogle} disabled={loading} />
        </div>

        {/* Navigate to register */}
        <p className="mt-8 text-center text-sm text-[#8a99a8]">
          Não tem uma conta?{" "}
          <Link to="/registro" className="font-bold text-[#5d85a6] hover:underline">
            Crie agora
          </Link>
        </p>
      </div>
    </div>
  );
}
