// src/pages/Agent.tsx
import React, { useEffect } from "react";

/* TS-typning för web komponenten så TSX inte klagar */
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

const WORKFLOW_ID = "wf_68eaeb8ac54481909e822336a91727b60297fb9b627b27f0"; // <-- byt till ditt
const DOMAIN_API_KEY = "domain_pk_68f5695c0778819093887a3935edd86d014c5cdba1e5dc2d"; // <-- din nyckel

export default function Agent() {
  useEffect(() => {
    // ladda ChatKit-scriptet en gång
    if (!document.querySelector<HTMLScriptElement>("#chatkit-sdk")) {
      const s = document.createElement("script");
      s.id = "chatkit-sdk";
      s.type = "module";
      s.src = "https://js.chatkit.openai.com/v1";
      document.head.appendChild(s);
    }
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden" }}>
      <openai-chatkit agent-workflow-id={WORKFLOW_ID} domain-api-key={DOMAIN_API_KEY} layout="full" />
    </div>
  );
}
