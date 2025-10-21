import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState } from 'react';

const BAS_URL = "https://riddermark-lead-view.vercel.app";

export default function Agent() {
  const [error, setError] = useState<string | null>(null);

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        try {
          // Om vi redan har en token, returnera den
          if (existing) {
            console.log("Återanvänder befintlig client_secret");
            return existing;
          }

          console.log("Hämtar ny client_secret från backend...");
          
          // Anropa din Vercel backend
          const res = await fetch(`${BAS_URL}/api/chatkit-start`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!res.ok) {
            const errorText = await res.text();
            console.error("Backend error:", res.status, errorText);
            throw new Error(`Backend returnerade ${res.status}: ${errorText}`);
          }

          const data = await res.json();
          console.log("Backend response:", data);

          if (!data.client_secret) {
            throw new Error("Backend returnerade ingen client_secret");
          }

          console.log("✅ client_secret mottagen");
          return data.client_secret;
          
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : "Okänt fel vid hämtning av client_secret";
          console.error("❌ getClientSecret error:", errorMsg);
          setError(errorMsg);
          throw new Error(errorMsg);
        }
      },
    },
  });

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-destructive/10 border border-destructive rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">ChatKit kunde inte laddas</h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <div className="text-xs text-muted-foreground space-y-2">
            <p>Kontrollera att:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Din backend endpoint <code className="bg-muted px-1 py-0.5 rounded">{BAS_URL}/api/chatkit-start</code> är tillgänglig</li>
              <li>Backend anropar OpenAI's ChatKit API korrekt</li>
              <li>Domänen är tillagd i ChatKit's allowlist</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <ChatKit 
        control={control} 
        className="w-full h-full"
      />
    </div>
  );
}
