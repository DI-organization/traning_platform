import cron from "node-cron";
import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { runDailyMaintenanceJob } from "./services/scheduler.service";

const app = createApp();

const server = app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${env.port}`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs available at http://localhost:${env.port}/api/docs`);
});

// Run once at boot so overdue/reminder state isn't stale after a restart,
// then hourly — frequent enough to flag overdue tasks promptly, while the
// reminder job's own dedup window keeps it from spamming notifications.
runDailyMaintenanceJob().catch((err) => console.error("[scheduler] initial run failed", err));
const scheduledTask = cron.schedule("0 * * * *", () => {
  runDailyMaintenanceJob().catch((err) => console.error("[scheduler] run failed", err));
});

async function shutdown() {
  scheduledTask.stop();
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
