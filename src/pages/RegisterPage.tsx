import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AuthHero } from "../components/shared/auth/AuthHero";
import { AuthInput } from "../components/shared/auth/AuthInput";
import { GoogleButton } from "../components/shared/auth/GoogleButton";
import { signUpWithEmail, signInWithGoogle } from "../services/authService";

import registerHero from "../assets/newaccount.webp";

/**
 * RegisterPage — Tela de cadastro da Alumia.
 * Cria uma nova conta por email/senha ou Google OAuth.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem. Verifique e tente novamente.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail({ email, password });
      navigate({ to: "/completar-perfil" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente.");
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

  return (
    <div className="flex min-h-screen flex-col bg-[#ebf4f8]">
      {/* Hero image */}
      <AuthHero src={registerHero} alt="Personagens celebrando o início da jornada" />

      {/* Form container */}
      <div className="mx-auto w-full max-w-md flex-1 px-6 pb-10 pt-6 flex flex-col justify-between">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-tight text-[#1a2530]">
            Comece sua jornada com a Alumia
          </h1>
          <p className="mt-2 text-sm text-[#8a99a8]">
            É um prazer te ter aqui. Vamos iluminar sua rotina, no seu ritmo.
          </p>

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <AuthInput
              id="register-email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              autoFocus
            />
            <AuthInput
              id="register-password"
              type="password"
              placeholder="Senha"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
            <AuthInput
              id="register-confirm-password"
              type="password"
              placeholder="Confirmar Senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />

            {/* Error feedback */}
            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-xs text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password || !confirmPassword}
              className="w-full rounded-2xl bg-[#cde2f2] py-4 text-base font-bold text-[#2a405a] shadow-[0_4px_12px_rgba(44,64,90,0.08)] hover:bg-[#bed5e8] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Criando conta…" : "Criar Conta"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#d5e3ef]" />
            <span className="text-xs font-bold text-[#8a99a8] tracking-wider">OU</span>
            <div className="h-px flex-1 bg-[#d5e3ef]" />
          </div>

          <GoogleButton label="Criar com o Google" onClick={handleGoogle} disabled={loading} />
        </div>

        {/* Navigate to login */}
        <p className="mt-8 text-center text-sm text-[#8a99a8]">
          Você já tem uma conta?{" "}
          <Link to="/login" className="font-bold text-[#5d85a6] hover:underline">
            Faça login aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
