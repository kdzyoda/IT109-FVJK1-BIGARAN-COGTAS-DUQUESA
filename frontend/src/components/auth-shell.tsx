import Link from "next/link";

const perks = [
  { icon: "🍽️", text: "Order from your favorite campus canteens" },
  { icon: "🛵", text: "Student runners deliver to you" },
  { icon: "⏱️", text: "Track your order from kitchen to door" },
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-primary p-3 sm:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl bg-card shadow-2xl md:grid-cols-2">
        {/* Brand side */}
      <div
  className="relative flex flex-col justify-between gap-6 overflow-hidden p-6 text-primary-foreground sm:p-10"
  style={{ background: "linear-gradient(135deg, #5a0d0d 0%, #7a1414 100%)" }}
>
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-secondary/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" />

          <Link href="/" className="t-brand relative text-3xl text-secondary">
            PaddlerGo
          </Link>

          <div className="relative space-y-3">
            <h1 className="t-hero text-2xl leading-tight sm:text-4xl">{title}</h1>
            <p className="t-promo text-base text-secondary sm:text-lg">{subtitle}</p>
          </div>

          <ul className="relative hidden space-y-3 md:block">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
                <span className="text-xl">{p.icon}</span>
                <span className="t-desc text-sm">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form side */}
        <div className="p-6 sm:p-10">{children}</div>
      </div>
    </main>
  );
}