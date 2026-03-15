import React from "react";
import { resolveStatusLabel } from "@/lib/utils";

type StageTimelineProps = {
  labels: {
    stage: Record<string, string>;
    status: Record<string, string>;
  };
  stages: Array<{
    stageType: string;
    status: string;
  }>;
};

export function StageTimeline({ labels, stages }: StageTimelineProps) {
  return (
    <ol className="stage-timeline">
      {stages.map((stage) => (
        <li key={stage.stageType}>
          <span className="stage-name">
            {resolveStatusLabel(stage.stageType, labels.stage)}
          </span>
          <span className={`status-badge status-${stage.status}`}>
            {resolveStatusLabel(stage.status, labels.status)}
          </span>
        </li>
      ))}
    </ol>
  );
}
