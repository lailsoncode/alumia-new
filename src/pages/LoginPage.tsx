import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/shared/auth/AuthLayout";
import { AuthInput } from "@/components/shared/auth/AuthInput";
import { GoogleButton } from "@/components/shared/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/ui/surface";
import { resetPassword, signInWithEmail, signInWithGoogle } from "@/services/authService";
import welcomeHero from "@/assets/welcome.webp";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmail({ email, password });
      navigate({ to: "/" });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Não foi possível entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Não foi possível entrar com Google.");
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError("Informe seu e-mail para receber o link de recuperação.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Não foi possível enviar o e-mail.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout src={welcomeHero} alt="Personagem da Alumia dando boas-vindas">
      <div>
        <p className="text-sm font-semibold text-primary">Que bom ter você de volta</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground sm:text-4xl">A casa é sua.</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">Entre para continuar cuidando do que importa, no seu ritmo.</p>

        <form onSubmit={handleLogin} className="mt-5 space-y-3" noValidate>
          <AuthInput id="login-email" label="E-mail" type="email" placeholder="voce@exemplo.com" value={email} onChange={setEmail} autoComplete="email" autoFocus />
          <AuthInput id="login-password" label="Senha" type="password" placeholder="Digite sua senha" value={password} onChange={setPassword} autoComplete="current-password" />

          {error && <InlineFeedback tone="danger">{error}</InlineFeedback>}
          {resetSent && <InlineFeedback tone="success">Enviamos o link de recuperação. Verifique sua caixa de entrada.</InlineFeedback>}

          <Button type="submit" size="lg" className="w-full" disabled={loading || !email || !password}>
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Esqueceu a senha?{" "}
          <button type="button" onClick={handleReset} className="min-h-11 font-semibold text-primary underline-offset-4 hover:underline">Recuperar acesso</button>
        </div>

        <div className="my-4 flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <GoogleButton label="Entrar com o Google" onClick={handleGoogle} disabled={loading} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Ainda não tem uma conta?{" "}
          <Link to="/registro" className="font-semibold text-primary underline-offset-4 hover:underline">Criar conta</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
