import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";

interface AuthInputProps {
  id: string;
  type?: "text" | "email" | "password";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  autoComplete?: string;
}

/**
 * AuthInput — Campo de input estilizado para telas de autenticação.
 * Inclui alternância de visibilidade para campos de senha.
 */
export function AuthInput({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  autoFocus,
  autoComplete,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative flex items-center w-full">
      <input
        id={id}
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        className="w-full rounded-2xl border-0 bg-white px-5 py-4 text-base text-foreground placeholder:text-[#8a99a8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
      {isPassword && (
        <button
          type="button"
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-4 text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon
            icon={showPassword ? ViewOffSlashIcon : ViewIcon}
            size={18}
            strokeWidth={1.5}
          />
        </button>
      )}
    </div>
  );
}
