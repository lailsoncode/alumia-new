import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/shared/auth/AuthLayout";
import { AuthInput } from "@/components/shared/auth/AuthInput";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/ui/surface";
import { updatePassword } from "@/services/authService";
import resetHero from "@/assets/resetpass.webp";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("Use pelo menos 6 caracteres na senha.");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      window.setTimeout(() => navigate({ to: "/login" }), 2000);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Não foi possível atualizar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout src={resetHero} alt="Personagem da Alumia em um ambiente tranquilo">
      <div>
        <p className="text-sm font-semibold text-primary">Proteja sua conta</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground sm:text-4xl">Crie uma nova senha.</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">Escolha uma senha de pelo menos 6 caracteres.</p>

        <form onSubmit={handleUpdatePassword} className="mt-5 space-y-3" noValidate>
          <AuthInput id="reset-password" label="Nova senha" type="password" placeholder="Pelo menos 6 caracteres" value={password} onChange={setPassword} autoComplete="new-password" autoFocus />
          <AuthInput id="reset-confirm-password" label="Confirmar nova senha" type="password" placeholder="Digite a senha novamente" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
          {error && <InlineFeedback tone="danger">{error}</InlineFeedback>}
          {success && <InlineFeedback tone="success">Senha atualizada. Você será levado para o login.</InlineFeedback>}
          <Button type="submit" size="lg" className="w-full" disabled={loading || !password || !confirmPassword || success}>
            {loading ? "Salvando…" : "Salvar nova senha"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Lembrou a senha?{" "}
          <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
