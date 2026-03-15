import React from "react";

type RequirementFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function RequirementForm({ action }: RequirementFormProps) {
  return (
    <form action={action} className="entry-form">
      <label>
        <span>Title</span>
        <input name="title" required />
      </label>
      <label>
        <span>Original request</span>
        <textarea name="originalRequest" required rows={4} />
      </label>
      <label>
        <span>Normalized description</span>
        <textarea name="normalizedDescription" required rows={4} />
      </label>
      <label>
        <span>Priority</span>
        <select name="priority" defaultValue="medium">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </label>
      <button type="submit">Add requirement</button>
    </form>
  );
}
