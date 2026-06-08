import { Link } from "@tanstack/react-router";

interface AuthHeroProps {
  /** Caminho para a imagem de fundo. */
  src: string;
  /** Texto alternativo para acessibilidade. */
  alt: string;
}

/**
 * AuthHero — Bloco de imagem hero para as telas de autenticação.
 * Exibe a imagem de forma limpa.
 */
export function AuthHero({ src, alt }: AuthHeroProps) {
  return (
    <div className="relative h-60 w-full overflow-hidden sm:h-72">
      <img src={src} alt={alt} className="h-full w-full object-cover object-center" />
    </div>
  );
}
