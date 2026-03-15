import React from "react";

type ChangeRequestFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  requirementOptions: Array<{ id: string; title: string }>;
};

export function ChangeRequestForm({
  action,
  requirementOptions,
}: ChangeRequestFormProps) {
  return (
    <form action={action} className="entry-form">
      <label>
        <span>Change type</span>
        <select name="changeType" defaultValue="modify">
          <option value="modify">Modify existing requirement</option>
          <option value="add">Add new requirement</option>
          <option value="delete">Delete existing requirement</option>
        </select>
      </label>
      <label>
        <span>Target requirement</span>
        <select name="targetRequirementId" defaultValue="">
          <option value="">No target</option>
          {requirementOptions.map((requirement) => (
            <option key={requirement.id} value={requirement.id}>
              {requirement.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Proposed title</span>
        <input name="proposedTitle" />
      </label>
      <label>
        <span>Proposed content</span>
        <textarea name="proposedContent" rows={4} />
      </label>
      <label>
        <span>Reason</span>
        <textarea name="reason" required rows={3} />
      </label>
      <label>
        <span>Impact summary</span>
        <textarea name="impactSummary" required rows={3} />
      </label>
      <button type="submit">Submit change request</button>
    </form>
  );
}
