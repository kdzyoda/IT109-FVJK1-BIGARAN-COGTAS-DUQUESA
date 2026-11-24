export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-4">
      {/* blurred food photo (scaled up so the blur doesn't leave pale edges) */}
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-[6px]"
        style={{ backgroundImage: "url('/auth-bg.jpg')" }}
      />

      {/* maroon tint so the photo matches the brand and the card stays readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(61,8,8,0.88) 0%, rgba(90,13,13,0.78) 50%, rgba(122,20,20,0.7) 100%)",
        }}
      />

      {/* soft gold glows */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-secondary/25 blur-3xl" />

      {/* subtle dot texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* dark vignette at the edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {children}

        <ul className="t-desc mt-6 flex flex-wrap justify-center gap-2 text-xs text-white">
          {["🍽️ Campus canteens", "🛵 Student runners", "⚡ Fast delivery"].map((t) => (
            <li
              key={t}
              className="rounded-full border border-white/25 bg-white/10 px-3 py-1 backdrop-blur"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}