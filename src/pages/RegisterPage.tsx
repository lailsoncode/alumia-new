import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/shared/auth/AuthLayout";
import { AuthInput } from "@/components/shared/auth/AuthInput";
import { GoogleButton } from "@/components/shared/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/ui/surface";
import { signInWithGoogle, signUpWithEmail } from "@/services/authService";
import registerHero from "@/assets/newaccount.webp";

export function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event: React.FormEvent) => {
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
      await signUpWithEmail({ email, password });
      navigate({ to: "/completar-perfil" });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Não foi possível criar sua conta.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Não foi possível continuar com Google.");
    }
  };

  return (
    <AuthLayout src={registerHero} alt="Personagens celebrando o início de uma jornada">
      <div>
        <p className="text-sm font-semibold text-primary">Seu espaço de cuidado</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground sm:text-4xl">Comece com leveza.</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">Crie sua conta e escolha os cuidados que fazem sentido para você.</p>

        <form onSubmit={handleRegister} className="mt-5 space-y-3" noValidate>
          <AuthInput id="register-email" label="E-mail" type="email" placeholder="voce@exemplo.com" value={email} onChange={setEmail} autoComplete="email" autoFocus />
          <AuthInput id="register-password" label="Senha" type="password" placeholder="Pelo menos 6 caracteres" value={password} onChange={setPassword} autoComplete="new-password" />
          <AuthInput id="register-confirm-password" label="Confirmar senha" type="password" placeholder="Digite a senha novamente" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />

          {error && <InlineFeedback tone="danger">{error}</InlineFeedback>}
          <Button type="submit" size="lg" className="w-full" disabled={loading || !email || !password || !confirmPassword}>
            {loading ? "Criando conta…" : "Criar conta"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>
        <GoogleButton label="Criar com o Google" onClick={handleGoogle} disabled={loading} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link to="/login" className="font-semibold text-primary underline-offset-4 hover:underline">Entrar</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
