// src/assets/Logo.tsx
export default function Logo({ h = 28 }: { h?: number }) {
  const LOGO_URL = "/branding/riddermark-logo.png?v=" + Date.now(); // ändra datum vid byte
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
