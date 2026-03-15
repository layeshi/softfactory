import React from "react";

type ProjectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  labels: {
    name: string;
    summary: string;
    goal: string;
    submit: string;
  };
};

export function ProjectForm({ action, labels }: ProjectFormProps) {
  return (
    <form action={action} className="entry-form">
      <label>
        <span>{labels.name}</span>
        <input name="name" required />
      </label>
      <label>
        <span>{labels.summary}</span>
        <textarea name="summary" required rows={3} />
      </label>
      <label>
        <span>{labels.goal}</span>
        <textarea name="goal" required rows={3} />
      </label>
      <button type="submit">{labels.submit}</button>
    </form>
  );
}
