import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AuthHero } from "../components/shared/auth/AuthHero";
import { AuthInput } from "../components/shared/auth/AuthInput";
import { updatePassword } from "../services/authService";

import resetHero from "../assets/resetpass.webp";

/**
 * ResetPasswordPage — Tela para definição de nova senha após recuperação.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
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
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#ebf4f8]">
      {/* Hero image */}
      <AuthHero src={resetHero} alt="Personagem redefinindo sua senha" />

      {/* Form container */}
      <div className="mx-auto w-full max-w-md flex-1 px-6 pb-10 pt-6 flex flex-col justify-between">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-tight text-[#1a2530]">
            Crie sua nova senha
          </h1>
          <p className="mt-2 text-sm text-[#8a99a8]">
            Escolha uma senha forte de pelo menos 6 caracteres para proteger sua conta.
          </p>

          <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
            <AuthInput
              id="reset-password"
              type="password"
              placeholder="Nova Senha"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              autoFocus
            />
            <AuthInput
              id="reset-confirm-password"
              type="password"
              placeholder="Confirmar Nova Senha"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />

            {/* Success and Error feedback */}
            {error && (
              <p className="rounded-xl bg-destructive/10 px-4 py-3 text-xs text-destructive">
                {error}
              </p>
            )}
            {success && (
              <p className="rounded-xl bg-tone-mint px-4 py-3 text-xs text-tone-mint-fg">
                Senha atualizada com sucesso! Redirecionando para o login...
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword || success}
              className="w-full rounded-2xl bg-[#cde2f2] py-4 text-base font-bold text-[#2a405a] shadow-[0_4px_12px_rgba(44,64,90,0.08)] hover:bg-[#bed5e8] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando…" : "Salvar Nova Senha"}
            </button>
          </form>
        </div>

        {/* Navigate back to login */}
        <p className="mt-8 text-center text-sm text-[#8a99a8]">
          Lembrou a senha?{" "}
          <Link to="/login" className="font-bold text-[#5d85a6] hover:underline">
            Faça login aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
