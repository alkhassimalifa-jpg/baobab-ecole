# BAOBAB ECOLE

Plateforme SaaS de gestion scolaire multi-etablissements, concue pour les ecoles privees tchadiennes (prescolaire au lycee).

Developpee par Alkhassim Ali.

**Auteur / Developpeur** : Alkhassim Ali - Developpeur Fullstack
**GitHub** : https://github.com/alkhassimalifa-jpg
**Email** : alkhassimalifa@gmail.com

## Stack technique

- **Framework** : Next.js 16 (App Router, Webpack en developpement suite a un bug connu Turbopack/LightningCSS sur Windows)
- **Langage** : TypeScript
- **Style** : Tailwind CSS v4
- **Base de donnees** : PostgreSQL (Neon), via Prisma ORM v7 avec driver adapter
- **Authentification** : Auth.js v5 (email/matricule + mot de passe, sessions JWT)
- **PDF** : @react-pdf/renderer (bulletins scolaires)
- **Securite** : bcrypt (hashage mots de passe), journal d'audit, isolation stricte multi-tenant

## Demarrage

```bash
npm install
```

Creer un fichier `.env` a la racine (voir `.env.example`) avec :
- `DATABASE_URL` : connexion PostgreSQL (Neon recommande)
- `AUTH_SECRET` : genere via `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

Puis :

```bash
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

L'application tourne sur http://localhost:3000

## Comptes de test (crees par le seed)

Mot de passe pour tous : `ChangeMoi123!`

| Role | Identifiant |
|---|---|
| Super Admin | admin@baobab-ecole.td |
| Directeur | directeur@college-saint-exupery.td |
| Enseignant | prof.maths@college-saint-exupery.td |
| Parent | parent.test@baobab-ecole.td |

## Roles geres

Super Administrateur, Directeur/Promoteur, Directeur adjoint, Responsable pedagogique, Secretaire, Comptable, Surveillant, Enseignant, Parent, Eleve - avec permissions distinctes basees sur la hierarchie scolaire tchadienne (Proviseur/Directeur, Censeur, Directeur des etudes, Surveillant General).

## Fonctionnalites principales

- Onboarding d'ecole par le Super Admin (ecole + annee scolaire + compte Directeur)
- Gestion du personnel avec titres de poste tchadiens
- Inscription d'eleves (creation automatique des comptes eleve et parent)
- Emploi du temps avec detection de conflits (enseignant, salle, classe)
- Saisie de notes et calcul de moyennes ponderees par coefficient
- Suivi des presences/absences
- Gestion financiere (types de frais obligatoires/optionnels, paiements, suivi des impayes)
- Bulletins scolaires (apercu web + export PDF, personnalisables par ecole)
- Connexion par URL propre a chaque ecole (`/ecole/[slug]/connexion`)

## Etat du projet - ce qui reste a faire avant une mise en ligne reelle

Ce projet est fonctionnel en developpement mais n'a jamais ete deploye en production. Avant un lancement reel :

**Securite**
- Brancher le rate limiting (librairie deja installee, jamais activee sur la connexion)
- Authentification a deux facteurs (MFA) pour les comptes admin
- Envoi d'email reel pour les mots de passe temporaires (actuellement affiches a l'ecran uniquement)

**Infrastructure**
- Hebergement (Vercel recommande pour Next.js)
- Nom de domaine
- Plan Neon sans mise en veille automatique
- Sauvegardes automatiques de la base

**Fonctionnalites**
- Annonces / communication interne
- Documents administratifs (certificats, attestations)
- Examens nationaux (BEF/Bac)
- Mode hors-ligne (PWA)
- Export Excel/CSV
- Gestion structuree des abonnements (Super Admin)

## Notes de developpement

- Windows/PowerShell : privilegier `[System.IO.File]::WriteAllText` avec encodage UTF8 sans BOM pour eviter les problemes d'encodage
- Les chemins contenant des crochets (`[...nextauth]`, `[slug]`) necessitent `-LiteralPath` dans les commandes PowerShell
- Toujours placer `<a` sur la meme ligne que son premier attribut dans le JSX (bug recurrent observe avec PowerShell qui supprime la balise si elle est seule sur sa ligne)