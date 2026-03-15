import React from "react";

type RequirementFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  labels: {
    title: string;
    originalRequest: string;
    normalizedDescription: string;
    priority: string;
    priorities: {
      high: string;
      medium: string;
      low: string;
    };
    submit: string;
  };
};

export function RequirementForm({ action, labels }: RequirementFormProps) {
  return (
    <form action={action} className="entry-form">
      <label>
        <span>{labels.title}</span>
        <input name="title" required />
      </label>
      <label>
        <span>{labels.originalRequest}</span>
        <textarea name="originalRequest" required rows={4} />
      </label>
      <label>
        <span>{labels.normalizedDescription}</span>
        <textarea name="normalizedDescription" required rows={4} />
      </label>
      <label>
        <span>{labels.priority}</span>
        <select name="priority" defaultValue="medium">
          <option value="high">{labels.priorities.high}</option>
          <option value="medium">{labels.priorities.medium}</option>
          <option value="low">{labels.priorities.low}</option>
        </select>
      </label>
      <button type="submit">{labels.submit}</button>
    </form>
  );
}
