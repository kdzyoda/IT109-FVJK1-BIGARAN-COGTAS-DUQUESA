import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const canteens = [
  { name: "Main Canteen Grill", note: "Rice meals and grilled favorites" },
  { name: "CCIS Snack Hub", note: "Quick bites and drinks" },
  { name: "Library Cafe", note: "Coffee, pastries and light meals" },
];

const dishes = [
  { name: "Chicken Adobo Rice", desc: "Tender chicken in soy and vinegar with garlic rice.", price: 85 },
  { name: "Pork Sisig", desc: "Sizzling chopped pork with onions, chili and egg.", price: 120 },
  { name: "Iced Calamansi Juice", desc: "Fresh calamansi, cold and refreshing.", price: 35 },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-primary px-6 py-20 text-primary-foreground">
        <div className="mx-auto max-w-6xl space-y-5">
          <p className="t-promo text-lg text-secondary">Hungry? Skip the line.</p>
          <h1 className="t-hero text-5xl md:text-6xl">PaddlerGo</h1>
          <p className="t-desc max-w-xl text-primary-foreground/80">
            Order from your favorite campus canteens and have a student runner
            deliver it to your building or room for just ₱5–₱10.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/menu" className={buttonVariants({ variant: "secondary", size: "lg" })}>
              Order now
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "lg" }) + " border-secondary bg-transparent text-secondary hover:bg-secondary/10"}
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-14 px-6 py-14">
        <section>
          <h2 className="t-section text-3xl text-primary">Campus canteens</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {canteens.map((c) => (
              <Card key={c.name}>
                <CardContent className="space-y-1 pt-6">
                  <div className="grid h-24 place-items-center rounded-lg bg-muted text-sm text-muted-foreground">
                    Canteen logo
                  </div>
                  <h3 className="t-food pt-3 text-lg">{c.name}</h3>
                  <p className="t-desc text-sm text-muted-foreground">{c.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="t-section text-3xl text-primary">Popular dishes</h2>
          <p className="t-promo mt-1 text-primary/80">Student favorites</p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {dishes.map((d) => (
              <Card key={d.name}>
                <CardContent className="space-y-1 pt-6">
                  <div className="grid h-32 place-items-center rounded-lg bg-muted text-sm text-muted-foreground">
                    Food photo
                  </div>
                  <h3 className="t-food pt-3 text-lg">{d.name}</h3>
                  <p className="t-desc text-sm text-muted-foreground">{d.desc}</p>
                  <div className="flex items-center justify-between pt-3">
                    <span className="t-price text-xl text-primary">₱{d.price}</span>
                    <Link href="/menu" className={buttonVariants({ variant: "secondary", size: "sm" })}>
                      Add to order
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}