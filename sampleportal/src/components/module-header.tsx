import type { ReactNode } from "react";

export function ModuleHeader({
  title,
  description,
  right,
}: {
  title: string;
  description: string;
  right?: ReactNode;
}) {
  return (
    <header className="module-header">
      <div>
        <h3>{title}</h3>
        <p className="muted">{description}</p>
      </div>
      {right ? <div className="control-row">{right}</div> : null}
    </header>
  );
}
