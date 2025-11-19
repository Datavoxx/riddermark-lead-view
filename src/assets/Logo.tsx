// src/assets/Logo.tsx
export default function Logo({ h = 48 }: { h?: number }) {
  const LOGO_URL = "/branding/svensk-bilsupport-logo.png?v=" + Date.now();
  return (
    <img
      src={LOGO_URL}
      alt="Svensk Bilsupport"
      style={{ height: h, width: "auto", display: "block" }}
      loading="eager"
      fetchPriority="high"
    />
  );
}
