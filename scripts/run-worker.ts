import { processNextExecutionRun } from "@/lib/services/execution-worker-service";

async function main() {
  const result = await processNextExecutionRun();
  const label = result ? `${result.id}:${result.status}` : "no-queued-runs";
  console.log(label);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
