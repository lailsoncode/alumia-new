import { useState } from "react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { FormField } from "@/components/ui/form-field";

interface AuthInputProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  autoComplete?: string;
  hint?: string;
  error?: string;
}

/**
 * AuthInput — Campo de input estilizado para telas de autenticação.
 * Inclui alternância de visibilidade para campos de senha.
 */
export function AuthInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoFocus,
  autoComplete,
  hint,
  error,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <FormField id={id} label={label} hint={hint} error={error}>
      <div className="relative flex w-full items-center">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className="min-h-12 w-full rounded-xl border border-input bg-surface px-4 py-3 pr-12 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/75 hover:border-primary/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
        {isPassword && (
          <button
            type="button"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <AlumiaIcon icon={showPassword ? ViewOffSlashIcon : ViewIcon} size="sm" />
          </button>
        )}
      </div>
    </FormField>
  );
}
