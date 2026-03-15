import React from "react";

type ProjectFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function ProjectForm({ action }: ProjectFormProps) {
  return (
    <form action={action} className="entry-form">
      <label>
        <span>Name</span>
        <input name="name" required />
      </label>
      <label>
        <span>Summary</span>
        <textarea name="summary" required rows={3} />
      </label>
      <label>
        <span>Goal</span>
        <textarea name="goal" required rows={3} />
      </label>
      <button type="submit">Create project</button>
    </form>
  );
}
