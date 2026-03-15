import React from "react";

type StatusPanelItem = {
  label: string;
  value: string;
};

type StatusPanelProps = {
  eyebrow?: string;
  title: string;
  items: StatusPanelItem[];
};

export function StatusPanel({ eyebrow, title, items }: StatusPanelProps) {
  return (
    <article className="status-panel">
      <div className="panel-heading">
        {eyebrow ? <span className="hero-eyebrow">{eyebrow}</span> : null}
        <h3>{title}</h3>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </li>
        ))}
      </ul>
    </article>
  );
}
