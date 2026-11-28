import { Navbar } from "@/components/navbar";
import { ProfileForm } from "@/components/profile-form";

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="t-hero text-4xl text-primary">My profile</h1>
        <p className="t-promo mt-1 text-primary/80">Where should we deliver?</p>
        <div className="mt-6">
          <ProfileForm />
        </div>
      </main>
    </div>
  );
}