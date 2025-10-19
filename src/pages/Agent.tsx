import React, { useEffect, useRef, useState } from "react";

// tillåt web-komponenten i TSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "openai-chatkit": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const BAS_URL = "https://chatkit-uii.onrender.com"; // din Render-URL

export default function Agent() {
  // <-- DEFAULT EXPORT
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState("Laddar…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // ladda SDK
        if (!document.querySelector("#chatkit-sdk")) {
          const s = document.createElement("script");
          s.id = "chatkit-sdk";
          s.type = "module";
          s.src = "https://js.chatkit.openai.com/v1";
          document.head.appendChild(s);
          await new Promise<void>((res, rej) => {
            s.onload = () => res();
            s.onerror = (e) => rej(e);
          });
        }
        if (cancelled || !hostRef.current) return;

        // skapa element och sätt options
        const el = document.createElement("openai-chatkit");
        el.classList.add("w-full", "h-full");
        hostRef.current.innerHTML = "";
        hostRef.current.appendChild(el);

        await new Promise((r) => setTimeout(r, 0));
        (el as any).setOptions?.({
          api: {
            async getClientSecret(current?: string) {
              if (!current) {
                const r = await fetch(`${BAS_URL}/chatkit/start`, { method: "POST" });
                const { client_secret } = await r.json();
                return client_secret;
              }
              return current;
            },
          },
          ui: { layout: "full" },
        });
        setStatus("");
      } catch (e) {
        console.error(e);
        setStatus("Kunde inte ladda ChatKit. Se konsolen.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full h-[calc(100vh-0px)] relative overflow-hidden">
      {status && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">{status}</div>
      )}
      <div ref={hostRef} className="w-full h-full" />
    </div>
  );
}
