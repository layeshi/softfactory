import React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { DocumentList } from "@/components/documents/document-list";
import { prisma } from "@/lib/db";

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    orderBy: {
      generatedAt: "desc",
    },
  });

  return (
    <AppShell
      eyebrow="Artifacts"
      title="Documents"
      description="Review generated requirement, design, and test artifacts stored in the local workspace."
    >
      <div className="section-span">
        <DocumentList documents={documents} />
      </div>
    </AppShell>
  );
}
