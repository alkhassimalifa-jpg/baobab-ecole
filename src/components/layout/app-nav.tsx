"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { BaobabMark } from "@/components/brand/baobab-mark";
import { getNavItemsForRole } from "@/lib/navigation";

type AppNavProps = {
  schoolName: string;
  userLabel: string;
  role: string;
};

export function AppNav({ schoolName, userLabel, role }: AppNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = getNavItemsForRole(role);

  return (
    <>
      <header className="bg-bark-700 text-white px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BaobabMark className="w-5 h-6 text-terracotta-500" />
          <span className="font-display text-base tracking-tight">BAOBAB</span>
          <span className="text-[10px] tracking-widest uppercase text-white/60">Ecole</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isOpen}
          className="flex flex-col justify-between w-5 h-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
        >
          <span className={`h-0.5 bg-white rounded transition-transform ${isOpen ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`h-0.5 bg-white rounded transition-opacity ${isOpen ? "opacity-0" : ""}`} />
          <span className={`h-0.5 bg-white rounded transition-transform ${isOpen ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </button>
      </header>

      <div className="bg-surface px-4 py-2 flex items-center justify-between border-b border-border">
        <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wide truncate">
          {schoolName}
        </span>
        <div className="w-8 h-8 rounded-full bg-terracotta-100 border border-terracotta-500 flex items-center justify-center text-[11px] font-bold text-terracotta-700 flex-shrink-0">
          {userLabel}
        </div>
      </div>

      {isOpen ? (
        <nav className="bg-bark-900 text-white">
          {navItems.map((item) => (
            <a key={item.href}
              href={item.href}
              className="block px-5 py-3.5 text-sm border-b border-white/10 hover:bg-white/5"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => signOut({ redirectTo: "/connexion" })}
            className="block w-full text-left px-5 py-3.5 text-sm text-terracotta-500 hover:bg-white/5"
          >
            Se deconnecter
          </button>
        </nav>
      ) : null}
    </>
  );
}