import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-0">
      <div>
        {eyebrow && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-2 block">
            {eyebrow}
          </span>
        )}
        <h1 className="text-3xl font-bold mb-1">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm leading-relaxed mt-1">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
}
