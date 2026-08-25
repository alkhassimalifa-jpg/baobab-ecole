import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSchoolBySlug } from "@/lib/data/school-by-slug";
import { LoginForm } from "@/app/connexion/login-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  return {
    title: school ? `Connexion - ${school.name}` : "Connexion",
  };
}

export default async function SchoolConnexionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);

  if (!school) {
    notFound();
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex lg:flex-col lg:justify-between bg-bark-700 text-white px-12 py-10">
        <div className="flex items-center gap-3">
          {school.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={school.logoUrl} alt={school.name} className="w-10 h-10 rounded-full object-cover" />
          ) : null}
          <span className="font-display text-xl tracking-tight">{school.name}</span>
        </div>
        <blockquote className="font-display italic text-lg leading-relaxed text-white/90 max-w-sm">
          Propulse par BAOBAB ECOLE
        </blockquote>
      </div>

      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 md:px-16 lg:px-20">
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            {school.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={school.logoUrl} alt={school.name} className="w-8 h-8 rounded-full object-cover" />
            ) : null}
            <span className="font-display text-lg tracking-tight text-bark-700">{school.name}</span>
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-1">
            Connexion
          </h1>
          <p className="text-sm text-foreground-muted mb-8">
            Accedez a votre espace de gestion.
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}