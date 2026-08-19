import { ReactNode } from "react";

type WidgetVariant = "notes" | "paiements" | "absences" | "planning";

const VARIANT_STYLES: Record<WidgetVariant, string> = {
  notes: "bg-bark-700",
  paiements: "bg-terracotta-700",
  absences: "bg-danger",
  planning: "bg-foliage-700",
};

type WidgetProps = {
  title: string;
  variant: WidgetVariant;
  children: ReactNode;
  footerHref?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
};

export function Widget({
  title,
  variant,
  children,
  footerHref,
  emptyMessage = "Rien a afficher pour le moment.",
  isEmpty = false,
}: WidgetProps) {
  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden mb-4">
      <div className={`px-3 py-2.5 text-sm font-semibold text-white ${VARIANT_STYLES[variant]}`}>
        {title}
      </div>
      {isEmpty ? (
        <p className="px-3 py-4 text-sm text-foreground-muted text-center">{emptyMessage}</p>
      ) : (
        <div>{children}</div>
      )}
      {footerHref && !isEmpty ? (
        <div className="px-3 py-2 text-right border-t border-border bg-background">
          <a href={footerHref} className="text-xs font-semibold text-terracotta-700">
            Voir tout →
          </a>
        </div>
      ) : null}
    </div>
  );
}

type WidgetRowProps = {
  title: string;
  meta: string;
  badge?: ReactNode;
};

export function WidgetRow({ title, meta, badge }: WidgetRowProps) {
  return (
    <div className="px-3 py-2.5 border-t border-border first:border-t-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {badge}
      </div>
      <p className="text-xs text-foreground-muted mt-0.5">{meta}</p>
    </div>
  );
}

type PillProps = {
  children: ReactNode;
  tone: "good" | "bad" | "neutral";
};

export function Pill({ children, tone }: PillProps) {
  const styles = {
    good: "bg-success-bg text-success",
    bad: "bg-danger-bg text-danger",
    neutral: "bg-bark-100 text-bark-700",
  };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${styles[tone]}`}>
      {children}
    </span>
  );
}