import React, { useEffect, useRef, useState } from "react";

/** TS-typning för web component så TSX inte klagar */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "openai-chatkit": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

const BAS_URL = "https://chatkit-uii.onrender.com"; // <-- din Render-URL

export default function Agent() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState("Laddar…");

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      try {
        setStatus("Laddar SDK…");
        // Ladda ChatKit SDK en gång
        if (!document.querySelector<HTMLScriptElement>("#chatkit-sdk")) {
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

        // Skapa & montera web componenten
        setStatus("Monterar chat…");
        hostRef.current.innerHTML = "";
        const el = document.createElement("openai-chatkit");
        el.classList.add("w-full", "h-full");
        hostRef.current.appendChild(el);

        // Vänta ett mikrosteg så att elementet hinner "upgradas" av SDK:t
        await new Promise((r) => setTimeout(r, 0));

        // Sätt options MED en funktionskropp -> här är return tillåten
        (el as any).setOptions?.({
          api: {
            // Den här körs av ChatKit när den behöver token
            async getClientSecret(current?: string) {
              // Första gången: hämta från din Render-backend
              if (!current) {
                const r = await fetch(`${BAS_URL}/chatkit/start`, {
                  method: "POST",
                });
                if (!r.ok) {
                  const t = await r.text();
                  throw new Error(`/chatkit/start failed: ${t}`);
                }
                const { client_secret } = await r.json();
                return client_secret; // <-- detta return ligger nu i en funktion (OK)
              }
              // (Valfritt) implementera refresh mot t.ex. `${BAS_URL}/chatkit/refresh`
              return current;
            },
          },
          ui: {
            layout: "full", // helsides UI (ingen bubbla)
          },
        });

        setStatus("");
      } catch (e) {
        console.error(e);
        setStatus("Kunde inte ladda ChatKit. Se konsolen.");
      }
    }

    mount();
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
