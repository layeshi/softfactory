import React from "react";

type StatusPanelItem = {
  label: string;
  value: string;
};

type StatusPanelProps = {
  title: string;
  items: StatusPanelItem[];
};

export function StatusPanel({ title, items }: StatusPanelProps) {
  return (
    <article className="status-panel">
      <div className="panel-heading">
        <span className="hero-eyebrow">Snapshot</span>
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
