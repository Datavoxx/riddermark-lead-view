import React, { useEffect, useRef, useState } from "react";

const WORKFLOW_ID = "wf_68eaeb8ac54481909e822336a91727b60297fb9b627b27f0"; // t.ex. wf_...
const DOMAIN_API_KEY = "domain_pk_68f5695c0778819093887a3935edd86d014c5cdba1e5dc2d"; // nyckeln du fick

export default function Agent() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState("Laddar ChatKit…");

  useEffect(() => {
    let cancelled = false;

    async function loadAndMount() {
      setStatus("Laddar SDK…");
      // Ladda scriptet en gång
      let s = document.querySelector<HTMLScriptElement>("#chatkit-sdk");
      if (!s) {
        s = document.createElement("script");
        s.id = "chatkit-sdk";
        s.type = "module";
        s.src = "https://js.chatkit.openai.com/v1";
        document.head.appendChild(s);
        await new Promise<void>((res, rej) => {
          s!.onload = () => res();
          s!.onerror = (e) => rej(e);
        });
      }

      if (cancelled || !hostRef.current) return;

      // Rensa & montera web component
      setStatus("Monterar chat…");
      hostRef.current.innerHTML = "";
      const wc = document.createElement("openai-chatkit");
      wc.setAttribute("agent-workflow-id", WORKFLOW_ID);
      wc.setAttribute("domain-api-key", DOMAIN_API_KEY);
      wc.setAttribute("layout", "full");
      hostRef.current.appendChild(wc);

      setStatus(""); // klart
    }

    loadAndMount().catch((e) => {
      console.error(e);
      setStatus("Kunde inte ladda ChatKit. Se konsolen.");
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full h-[calc(100vh-0px)] overflow-hidden">
      {/* Visar text tills chatten är monterad */}
      {status && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">{status}</div>
      )}
      <div ref={hostRef} className="w-full h-full" />
    </div>
  );
}
