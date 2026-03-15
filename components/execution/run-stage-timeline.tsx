import React from "react";
import { resolveStatusLabel } from "@/lib/utils";

type RunStageTimelineProps = {
  labels: {
    stage: Record<string, string>;
    status: Record<string, string>;
    logs: string;
    result: string;
  };
  stageRuns: Array<{
    id: string;
    stageType: string;
    status: string;
    stdoutPath?: string | null;
    resultSnapshotPath?: string | null;
  }>;
};

export function RunStageTimeline({ labels, stageRuns }: RunStageTimelineProps) {
  return (
    <ul className="stage-timeline">
      {stageRuns.map((stageRun) => (
        <li key={stageRun.id}>
          <div>
            <strong className="stage-name">
              {resolveStatusLabel(stageRun.stageType, labels.stage)}
            </strong>
            <p>{resolveStatusLabel(stageRun.status, labels.status)}</p>
          </div>
          <div className="timeline-meta">
            {stageRun.stdoutPath ? <small>{labels.logs}</small> : null}
            {stageRun.resultSnapshotPath ? <small>{labels.result}</small> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
