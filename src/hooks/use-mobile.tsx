import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Hook para detectar se a tela atual é de um dispositivo móvel.
 * Baseia-se no tamanho da janela do navegador (menor que 768px).
 *
 * @returns {boolean} Retorna `true` se for mobile, `false` caso contrário.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
