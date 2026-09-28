import { useState } from "react";
import * as RiveReact from "@rive-app/react-canvas";
import fallbackImage from "@/assets/alumia/alumia-chibi-idle-v1.png";

const riveSource = "/alumia/alumia-rive-bust-v2.riv";

type RiveAlumiaProps = {
  className?: string;
  alt?: string;
};

/**
 * A pequena ponte entre o avatar flutuante e o arquivo Rive exportado.
 * O PNG continua como fallback para que a presença não suma se o runtime
 * estiver indisponível em um WebView antigo ou durante um carregamento lento.
 */
export function RiveAlumia({ className, alt = "Alumia" }: RiveAlumiaProps) {
  const [riveReady, setRiveReady] = useState(false);
  const { RiveComponent } = RiveReact.useRive({
    src: riveSource,
    artboard: "Alumia · busto fiel",
    stateMachine: "AlumiaPresence",
    autoplay: true,
    onRiveReady: () => setRiveReady(true),
  });

  return (
    <span className={`relative block ${className ?? ""}`} role="img" aria-label={alt}>
      {!riveReady && (
        <img
          src={fallbackImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-contain object-bottom"
        />
      )}
      <RiveComponent
        className="relative z-[1] block h-full w-full"
      />
    </span>
  );
}
