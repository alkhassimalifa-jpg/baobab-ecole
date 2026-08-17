import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { BaobabMark } from "@/components/brand/baobab-mark";

export const metadata: Metadata = {
  title: "Connexion — BAOBAB ECOLE",
};

export default function ConnexionPage() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Panneau de marque - visible seulement a partir de lg (desktop) */}
      <div className="hidden lg:flex lg:flex-col lg:justify-between bg-bark-700 text-white px-12 py-10">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl tracking-tight">BAOBAB</span>
          <span className="text-sm text-white/70 tracking-widest uppercase">Ecole</span>
        </div>

        <div className="flex flex-col items-center">
          <BaobabMark className="w-40 h-48 text-terracotta-500" />
        </div>

        <blockquote className="font-display italic text-lg leading-relaxed text-white/90 max-w-sm">
          « Ses racines tiennent l&apos;ecole. Ses branches relient les familles. »
        </blockquote>
      </div>

      {/* Panneau formulaire - prioritaire sur mobile */}
      <div className="flex flex-col justify-center px-6 py-10 sm:px-10 md:px-16 lg:px-20">
        <div className="w-full max-w-sm mx-auto">
          {/* Logo compact - visible sur mobile uniquement, remplace le panneau de marque */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <BaobabMark className="w-8 h-9 text-bark-700" />
            <span className="font-display text-lg tracking-tight text-bark-700">BAOBAB</span>
            <span className="text-xs text-foreground-muted tracking-widest uppercase">Ecole</span>
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