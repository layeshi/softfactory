import React from "react";

type ChangeRequestFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  requirementOptions: Array<{ id: string; title: string }>;
  labels: {
    changeType: string;
    targetRequirement: string;
    proposedTitle: string;
    proposedContent: string;
    reason: string;
    impactSummary: string;
    noTarget: string;
    modifyExisting: string;
    addNew: string;
    deleteExisting: string;
    submit: string;
  };
};

export function ChangeRequestForm({
  action,
  labels,
  requirementOptions,
}: ChangeRequestFormProps) {
  return (
    <form action={action} className="entry-form">
      <label>
        <span>{labels.changeType}</span>
        <select name="changeType" defaultValue="modify">
          <option value="modify">{labels.modifyExisting}</option>
          <option value="add">{labels.addNew}</option>
          <option value="delete">{labels.deleteExisting}</option>
        </select>
      </label>
      <label>
        <span>{labels.targetRequirement}</span>
        <select name="targetRequirementId" defaultValue="">
          <option value="">{labels.noTarget}</option>
          {requirementOptions.map((requirement) => (
            <option key={requirement.id} value={requirement.id}>
              {requirement.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{labels.proposedTitle}</span>
        <input name="proposedTitle" />
      </label>
      <label>
        <span>{labels.proposedContent}</span>
        <textarea name="proposedContent" rows={4} />
      </label>
      <label>
        <span>{labels.reason}</span>
        <textarea name="reason" required rows={3} />
      </label>
      <label>
        <span>{labels.impactSummary}</span>
        <textarea name="impactSummary" required rows={3} />
      </label>
      <button type="submit">{labels.submit}</button>
    </form>
  );
}
