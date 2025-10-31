// src/assets/Logo.tsx
export default function Logo({ h = 48 }: { h?: number }) {
  const LOGO_URL = "/branding/riddermark-logo-new.png?v=" + Date.now();
  return (
    <img
      src={LOGO_URL}
      alt="Riddermark"
      style={{ height: h, width: "auto", display: "block" }}
      loading="eager"
      fetchPriority="high"
    />
  );
}
