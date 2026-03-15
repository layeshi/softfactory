import React from "react";
import { titleizeStatus } from "@/lib/utils";

type StageTimelineProps = {
  stages: Array<{
    stageType: string;
    status: string;
  }>;
};

export function StageTimeline({ stages }: StageTimelineProps) {
  return (
    <ol className="stage-timeline">
      {stages.map((stage) => (
        <li key={stage.stageType}>
          <span className="stage-name">{titleizeStatus(stage.stageType)}</span>
          <span className={`status-badge status-${stage.status}`}>
            {titleizeStatus(stage.status)}
          </span>
        </li>
      ))}
    </ol>
  );
}
