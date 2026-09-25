import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ImageUploadIcon } from "@hugeicons/core-free-icons";
import { AuthLayout } from "@/components/shared/auth/AuthLayout";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { InlineFeedback } from "@/components/ui/surface";
import { useAuth } from "@/hooks/use-auth";
import { updateUserProfile } from "@/services/authService";
import registerHero from "@/assets/newaccount.webp";

const fieldClass = "min-h-12 w-full rounded-xl border border-input bg-surface px-4 py-3 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/75 hover:border-primary/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30";

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName || "");
    setLastName(profile.lastName || "");
    setBio(profile.bio || "");
    setGoals(profile.goals || "");
    if (profile.avatarUrl && !profile.avatarUrl.startsWith("blob:")) setAvatarPreview(profile.avatarUrl);
  }, [profile]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Escolha uma imagem menor que 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const sourceSize = Math.min(image.width, image.height);
        canvas.width = 150;
        canvas.height = 150;
        const context = canvas.getContext("2d");
        if (!context) return;
        context.drawImage(image, (image.width - sourceSize) / 2, (image.height - sourceSize) / 2, sourceSize, sourceSize, 0, 0, 150, 150);
        setAvatarPreview(canvas.toDataURL("image/jpeg", 0.7));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) {
      setSaveError("Entre novamente para salvar seu perfil.");
      return;
    }
    setLoading(true);
    setSaveError(null);
    try {
      await updateUserProfile(user.id, { firstName, lastName, bio, goals, avatarUrl: avatarPreview || "" });
      await refreshProfile();
      navigate({ to: "/" });
    } catch (caught: unknown) {
      setSaveError(caught instanceof Error ? caught.message : "Não foi possível salvar seu perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout src={registerHero} alt="Personagens da Alumia celebrando uma nova jornada">
      <div>
        <p className="text-sm font-semibold text-primary">Só mais um passo</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground sm:text-4xl">Deixe a Alumia com a sua cara.</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">Você pode editar estas informações quando quiser.</p>

        <form onSubmit={handleSave} className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-subtle p-3.5">
            <button
              type="button"
              aria-label="Escolher foto de perfil"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-input bg-surface text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {avatarPreview ? <img src={avatarPreview} alt="Foto de perfil selecionada" className="h-full w-full object-cover" /> : <AlumiaIcon icon={ImageUploadIcon} size="lg" />}
            </button>
            <div>
              <p className="text-sm font-semibold text-foreground">Foto de perfil</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">JPG, PNG ou WebP com até 5 MB.</p>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-2 min-h-10 text-sm font-semibold text-primary underline-offset-4 hover:underline">Escolher imagem</button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <FormField id="profile-firstname" label="Nome">
              <input id="profile-firstname" value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" className={fieldClass} />
            </FormField>
            <FormField id="profile-lastname" label="Sobrenome">
              <input id="profile-lastname" value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" className={fieldClass} />
            </FormField>
          </div>
          <FormField id="profile-bio" label="Sobre você" hint="Compartilhe apenas o que fizer sentido.">
            <textarea id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} rows={3} className={`${fieldClass} resize-y`} />
          </FormField>
          <FormField id="profile-goals" label="O que você quer cuidar agora?">
            <textarea id="profile-goals" value={goals} onChange={(event) => setGoals(event.target.value)} rows={3} className={`${fieldClass} resize-y`} />
          </FormField>

          {saveError && <InlineFeedback tone="danger">{saveError}</InlineFeedback>}
          <Button type="submit" size="lg" className="w-full" disabled={loading || !firstName.trim()}>{loading ? "Salvando…" : "Salvar perfil"}</Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => navigate({ to: "/" })}>Continuar sem preencher agora</Button>
        </form>
      </div>
    </AuthLayout>
  );
}
