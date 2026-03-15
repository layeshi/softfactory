import React from "react";
import Link from "next/link";
import { resolveStatusLabel } from "@/lib/utils";

type RunHistoryListProps = {
  labels: {
    runType: Record<string, string>;
    status: Record<string, string>;
    openRun: string;
  };
  runs: Array<{
    id: string;
    runType: string;
    status: string;
    currentStage: string | null;
  }>;
};

export function RunHistoryList({ labels, runs }: RunHistoryListProps) {
  return (
    <div className="stack-list">
      {runs.map((run) => (
        <article key={run.id} className="stack-card">
          <div className="stack-card-header">
            <div>
              <h3>{resolveStatusLabel(run.runType, labels.runType)}</h3>
              <p>{run.currentStage ?? "-"}</p>
            </div>
            <span className={`status-badge status-${run.status}`}>
              {resolveStatusLabel(run.status, labels.status)}
            </span>
          </div>
          <Link href={`/runs/${run.id}`}>{labels.openRun}</Link>
        </article>
      ))}
    </div>
  );
}
