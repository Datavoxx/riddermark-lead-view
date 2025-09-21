// src/assets/Logo.tsx
export default function Logo({ h = 48 }: { h?: number }) {
  const LOGO_URL = "/branding/gothiabil-logo.png?v=" + Date.now(); // ändra datum vid byte
  return (
    <img
      src={LOGO_URL}
      alt="GothiaBil"
      style={{ height: h, width: "auto", display: "block" }}
      loading="eager"
      fetchPriority="high"
    />
  );
}
