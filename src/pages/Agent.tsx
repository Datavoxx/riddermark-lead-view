import React, { useEffect, useRef, useState } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "openai-chatkit": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "agent-workflow-id"?: string;
        "domain-api-key"?: string;
        layout?: string;
      };
    }
  }
}

const BAS_URL = "https://chatkit-uii.onrender.com"; // <-- Render-URL
const WORKFLOW_ID = "wf_68eaeb8ac54481909e822336a91727b60297fb9b627b27f0"; // <-- ditt workflow-id
const DOMAIN_API_KEY = "domain_pk_68f76d57ae2c819082db402cd8dde0fb0c2d5dfb0d20a63a"; // <-- din domain key

export default function Agent() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState("Laddar…");

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      try {
        setStatus("Laddar SDK…");
        // 1) Ladda SDK
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

        // Debug: är komponenten registrerad?
        // @ts-ignore
        console.log("openai-chatkit registered?", !!customElements.get("openai-chatkit"));

        if (cancelled || !hostRef.current) return;

        // 2) Skapa elementet och sätt nödvändiga attribut
        const el = document.createElement("openai-chatkit");
        el.setAttribute("agent-workflow-id", WORKFLOW_ID);
        el.setAttribute("domain-api-key", DOMAIN_API_KEY);
        el.setAttribute("layout", "full");

        hostRef.current.innerHTML = "";
        hostRef.current.appendChild(el);

        // Vänta ett mikrosteg
        await new Promise((r) => setTimeout(r, 0));

        // 3) Sätt options → client_secret via backend
        // @ts-ignore
        el.setOptions?.({
          api: {
            async getClientSecret(current?: string) {
              try {
                if (!current) {
                  const r = await fetch(`${BAS_URL}/chatkit/start`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // mode: "cors" // (behövs sällan men går att tvinga)
                  });
                  const text = await r.text();
                  if (!r.ok) {
                    console.error("start failed:", r.status, text);
                    throw new Error(text);
                  }
                  const { client_secret } = JSON.parse(text);
                  console.log("client_secret OK");
                  return client_secret;
                }
                return current;
              } catch (e) {
                const errorMsg = e instanceof Error ? e.message : "Nätverksfel vid hämtning av client_secret";
                console.error("getClientSecret error:", errorMsg);
                throw new Error(errorMsg);
              }
            },
          },
          ui: { layout: "full" },
        });

        setStatus("");
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Okänt fel uppstod";
        console.error("Mount error:", errorMsg, e);
        setStatus(`Kunde inte ladda ChatKit: ${errorMsg}`);
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
