import React from "react";
import { resolveStatusLabel } from "@/lib/utils";
import { RunStageTimeline } from "@/components/execution/run-stage-timeline";

type RunDetailPanelProps = {
  labels: {
    summary: string;
    artifacts: string;
    decisions: string;
    runType: Record<string, string>;
    status: Record<string, string>;
    stage: Record<string, string>;
    logs: string;
    result: string;
    executionMode: Record<string, string>;
    taskPackage: string;
    worktree: string;
    requirementTitle: string;
  };
  run: {
    runType: string;
    executionMode: string;
    status: string;
    taskPackagePath: string | null;
    worktreePath: string | null;
    requirement: {
      title: string;
    };
    stageRuns: Array<{
      id: string;
      stageType: string;
      status: string;
      stdoutPath: string | null;
      resultSnapshotPath: string | null;
    }>;
    artifacts: Array<{
      id: string;
      title: string;
      summary: string | null;
      filePath: string;
    }>;
  };
};

export function RunDetailPanel({ labels, run }: RunDetailPanelProps) {
  return (
    <div className="stack-list">
      <article className="stack-card">
        <span className="metric-label">{labels.summary}</span>
        <h3>{resolveStatusLabel(run.executionMode, labels.executionMode)}</h3>
        <p>{resolveStatusLabel(run.runType, labels.runType)}</p>
        <p>{resolveStatusLabel(run.status, labels.status)}</p>
        <p>
          {labels.requirementTitle}: {run.requirement.title}
        </p>
        <p>
          {labels.taskPackage}: {run.taskPackagePath ?? "-"}
        </p>
        <p>
          {labels.worktree}: {run.worktreePath ?? "-"}
        </p>
      </article>

      <article className="stack-card">
        <RunStageTimeline
          labels={{
            stage: labels.stage,
            status: labels.status,
            logs: labels.logs,
            result: labels.result,
          }}
          stageRuns={run.stageRuns}
        />
      </article>

      <article className="stack-card">
        <span className="metric-label">{labels.artifacts}</span>
        <div className="stack-list">
          {run.artifacts.map((artifact) => (
            <article key={artifact.id} className="stack-card">
              <h3>{artifact.title}</h3>
              <p>{artifact.summary ?? artifact.filePath}</p>
              <small>{artifact.filePath}</small>
            </article>
          ))}
        </div>
      </article>
    </div>
  );
}
