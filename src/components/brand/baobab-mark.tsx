type BaobabMarkProps = {
  className?: string;
};

export function BaobabMark({ className = "" }: BaobabMarkProps) {
  return (
    <svg
      viewBox="0 0 200 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Tronc */}
      <path
        d="M92 240V150C92 150 78 140 78 120C78 100 92 92 100 92C108 92 122 100 122 120C122 140 108 150 108 150V240"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Branches - gauche */}
      <path
        d="M92 100C92 100 60 88 45 60C40 51 38 40 38 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M88 108C88 108 55 105 35 88"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Branches - droite */}
      <path
        d="M108 100C108 100 140 88 155 60C160 51 162 40 162 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M112 108C112 108 145 105 165 88"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Branche centrale */}
      <path
        d="M100 92V45C100 45 100 30 100 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Racines */}
      <path
        d="M92 240C92 240 82 232 74 230M108 240C108 240 118 232 126 230"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}