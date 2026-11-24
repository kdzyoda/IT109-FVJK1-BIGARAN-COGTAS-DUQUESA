export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="relative grid min-h-screen place-items-center overflow-hidden p-4"
      style={{
        background:
          "radial-gradient(circle at 20% 15%, #9b1c1c 0%, transparent 45%), linear-gradient(135deg, #3d0808 0%, #5a0d0d 45%, #7a1414 100%)",
      }}
    >
      {/* soft gold glows */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />

      {/* subtle dot pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}