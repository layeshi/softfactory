import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/dashboard/metric-card";
import { StatusPanel } from "@/components/dashboard/status-panel";

export default function HomePage() {
  return (
    <AppShell
      eyebrow="Phase One"
      title="Software Factory"
      description="Operate projects, requirements, approvals, and generated documents from one local command center."
    >
      <MetricCard
        label="Projects"
        value="0"
        detail="Create the first project to begin a structured delivery cycle."
      />
      <MetricCard
        label="Pending approvals"
        value="0"
        detail="Human confirmation gates will appear here once requirements enter review."
      />
      <StatusPanel
        title="First-release scope"
        items={[
          { label: "Project management", value: "Ready" },
          { label: "Requirement intake", value: "In build" },
          { label: "Workflow tracking", value: "In build" },
        ]}
      />
    </AppShell>
  );
}
