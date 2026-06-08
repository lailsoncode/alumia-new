import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { ImageUploadIcon } from "@hugeicons/core-free-icons";
import { useAuth } from "../hooks/use-auth";
import { getUserProfile, updateUserProfile } from "../services/authService";

/**
 * CompleteProfilePage — Tela de onboarding pós-cadastro.
 * O usuário preenche nome, sobrenome, bio e metas antes de acessar o app.
 */
export function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [goals, setGoals] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      getUserProfile(user.id)
        .then((profile) => {
          if (profile) {
            setFirstName(profile.firstName || "");
            setLastName(profile.lastName || "");
            setBio(profile.bio || "");
            setGoals(profile.goals || "");
            if (profile.avatarUrl && !profile.avatarUrl.startsWith("blob:")) {
              setAvatarPreview(profile.avatarUrl);
            }
          }
        })
        .catch((err) => console.error("Erro ao carregar perfil:", err));
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSaveError("A imagem é muito grande. Escolha uma imagem menor que 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = Math.min(img.width, img.height);
          const targetSize = 150;
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            const sx = (img.width - size) / 2;
            const sy = (img.height - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, 0, 0, targetSize, targetSize);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
            setAvatarPreview(dataUrl);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setSaveError("Você precisa estar autenticado para salvar o perfil.");
      return;
    }

    setLoading(true);
    setSaveError(null);

    try {
      await updateUserProfile(user.id, {
        firstName,
        lastName,
        bio,
        goals,
        avatarUrl: avatarPreview || "",
      });
      navigate({ to: "/" });
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "Erro ao salvar perfil. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border-0 bg-white px-5 py-4 text-base text-foreground placeholder:text-[#8a99a8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none";

  return (
    <div className="flex min-h-screen flex-col items-center bg-[#ebf4f8] px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="font-display text-center text-[26px] font-bold leading-tight text-[#1a2530]">
          Complete o seu Perfil
        </h1>
        <p className="mt-2 text-center text-sm text-[#8a99a8]">
          Vamos personalizar sua experiência para você.
        </p>

        {/* Avatar upload */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            type="button"
            aria-label="Carregar foto de perfil"
            onClick={() => fileInputRef.current?.click()}
            className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#b8c9d9] bg-white transition-colors hover:border-primary hover:bg-slate-50 shadow-sm"
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <HugeiconsIcon
                icon={ImageUploadIcon}
                size={28}
                strokeWidth={1.5}
                className="text-[#8a99a8]"
              />
            )}
          </button>
          <p className="text-xs text-[#8a99a8]">Clique no círculo para carregar uma imagem</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <input
            id="profile-firstname"
            type="text"
            placeholder="Seu nome"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoFocus
            className={inputClass}
          />
          <input
            id="profile-lastname"
            type="text"
            placeholder="Sobrenome"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
          <textarea
            id="profile-bio"
            placeholder="Fale um pouco sobre você…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className={inputClass}
          />
          <textarea
            id="profile-goals"
            placeholder="E quais suas metas? (ex. Me organizar melhor)"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={3}
            className={inputClass}
          />

          {saveError && (
            <p className="rounded-xl bg-destructive/10 px-4 py-3 text-xs text-destructive">
              {saveError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !firstName}
            className="mt-6 w-full rounded-2xl bg-[#cde2f2] py-4 text-base font-bold text-[#2a405a] shadow-[0_4px_12px_rgba(44,64,90,0.08)] hover:bg-[#bed5e8] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Salvando…" : "Salvar Perfil"}
          </button>
        </form>

        {/* Skip for now */}
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="mt-6 w-full text-center text-sm font-bold text-[#5d85a6] hover:underline"
        >
          Pular por agora
        </button>
      </div>
    </div>
  );
}
