import React from "react";

type RunLaunchFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  labels: {
    runType: string;
    executionMode: string;
    targetStage: string;
    submit: string;
    runTypes: Record<string, string>;
    executionModes: Record<string, string>;
    stages: Record<string, string>;
  };
};

export function RunLaunchForm({ action, labels }: RunLaunchFormProps) {
  return (
    <form action={action} className="entry-form">
      <label>
        <span>{labels.runType}</span>
        <select name="runType" defaultValue="full_run">
          {Object.entries(labels.runTypes).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{labels.executionMode}</span>
        <select name="executionMode" defaultValue="manual_gate">
          {Object.entries(labels.executionModes).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{labels.targetStage}</span>
        <select name="targetStage" defaultValue="design">
          {Object.entries(labels.stages).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">{labels.submit}</button>
    </form>
  );
}
