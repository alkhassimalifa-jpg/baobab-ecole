export type NavItem = {
  href: string;
  label: string;
};

const MANAGEMENT_ROLES = ["DIRECTOR", "PROMOTER", "DEPUTY_DIRECTOR", "PEDAGOGICAL_HEAD"];

export function getNavItemsForRole(role: string): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "Accueil" },
    { href: "/profil", label: "Mon profil" },
  ];

  if (MANAGEMENT_ROLES.includes(role)) {
    items.push(
      { href: "/eleves", label: "Eleves" },
      { href: "/eleves/nouveau", label: "Inscrire un eleve" },
      { href: "/structure", label: "Classes et matieres" },
      { href: "/personnel", label: "Personnel" },
      { href: "/affectations", label: "Affectations" },
      { href: "/presences", label: "Presences" },
      { href: "/emploi-du-temps/gestion", label: "Gerer emploi du temps" },
      { href: "/enseignants", label: "Enseignants" },
      { href: "/enseignants/nouveau", label: "Ajouter un enseignant" },
      { href: "/comptabilite", label: "Comptabilite" },
      { href: "/frais-impayes", label: "Frais impayes" },
      { href: "/parametres/ecole", label: "Parametres de l ecole" },
      { href: "/parametres/bulletin", label: "Parametres bulletin" }
    );
  }

  if (role === "SECRETARY") {
    items.push(
      { href: "/eleves", label: "Eleves" },
      { href: "/eleves/nouveau", label: "Inscrire un eleve" },
      { href: "/comptabilite", label: "Comptabilite" },
      { href: "/frais-impayes", label: "Frais impayes" }
    );
  }

  if (role === "TEACHER") {
    items.push(
      { href: "/emploi-du-temps", label: "Emploi du temps" },
      { href: "/notes/saisie", label: "Saisie de notes" },
      { href: "/presences", label: "Presences" }
    );
  }

  if (role === "PARENT") {
    items.push(
      { href: "/emploi-du-temps", label: "Emploi du temps" },
      { href: "/notes", label: "Notes" },
      { href: "/frais-payes", label: "Frais payes" },
      { href: "/absences", label: "Absences" },
      { href: "/bulletin", label: "Bulletin" }
    );
  }

  if (role === "SURVEILLANT") {
    items.push({ href: "/presences", label: "Presences" });
  }

  if (role === "ACCOUNTANT") {
    items.push(
      { href: "/comptabilite", label: "Comptabilite" },
      { href: "/frais-impayes", label: "Frais impayes" }
    );
  }

  if (role === "STUDENT") {
    items.push(
      { href: "/emploi-du-temps", label: "Emploi du temps" },
      { href: "/notes", label: "Notes" },
      { href: "/absences", label: "Absences" },
      { href: "/bulletin", label: "Bulletin" }
    );
  }

  if (role === "SUPER_ADMIN") {
    items.push(
      { href: "/ecoles", label: "Ecoles" },
      { href: "/ecoles/nouvelle", label: "Ajouter une ecole" }
    );
  }

  return items;
}