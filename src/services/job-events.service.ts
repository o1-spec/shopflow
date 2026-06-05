import { Worker } from "bullmq";
import { JobEvent } from "@/models/JobEvent";
import { WorkerHeartbeat } from "@/models/WorkerHeartbeat";
import { connectToDatabase } from "@/lib/mongodb";

export async function recordJobEvent(payload: any) {
  await connectToDatabase();
  await JobEvent.create(payload);
}

export function startWorkerTelemetry(worker: Worker) {
  let activeJobs = 0;
  let processedCount = 0;
  let failedCount = 0;

  console.log(`📡 Telemetry initialized for worker on queue [${worker.name}]`);

  // Initialize heartbeat record on startup
  connectToDatabase().then(async () => {
    await WorkerHeartbeat.findOneAndUpdate(
      { workerName: `${worker.name}-worker`, queueName: worker.name },
      {
        status: "healthy",
        lastSeenAt: new Date(),
        activeJobs: 0,
      },
      { upsert: true }
    );
  }).catch(err => console.error("Failed to initialize worker heartbeat:", err));

  worker.on("active", async (job) => {
    activeJobs++;
    try {
      await recordJobEvent({
        queueName: worker.name,
        jobId: job.id,
        orderId: job.data?.orderId,
        event: "active",
        attemptsMade: job.attemptsMade,
      });
    } catch (err) {
      console.error(`[${worker.name}] Failed to log active event:`, err);
    }
  });

  worker.on("completed", async (job) => {
    activeJobs = Math.max(0, activeJobs - 1);
    processedCount++;
    try {
      const durationMs = job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : undefined;
      await recordJobEvent({
        queueName: worker.name,
        jobId: job.id,
        orderId: job.data?.orderId,
        event: "completed",
        attemptsMade: job.attemptsMade,
        durationMs,
      });
    } catch (err) {
      console.error(`[${worker.name}] Failed to log completed event:`, err);
    }
  });

  worker.on("failed", async (job, err) => {
    activeJobs = Math.max(0, activeJobs - 1);
    failedCount++;
    try {
      const attemptsMade = job ? job.attemptsMade : 0;
      const maxAttempts = job?.opts?.attempts || 3;
      const durationMs = job && job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : undefined;
      
      const isDeadLetter = attemptsMade >= maxAttempts;
      const eventType = isDeadLetter ? "dead_lettered" : "failed";

      await recordJobEvent({
        queueName: worker.name,
        jobId: job?.id || "unknown",
        orderId: job?.data?.orderId,
        event: eventType,
        attemptsMade,
        errorMessage: err.message,
        durationMs,
      });

      if (!isDeadLetter && job) {
        await recordJobEvent({
          queueName: worker.name,
          jobId: job.id,
          orderId: job.data?.orderId,
          event: "retried",
          attemptsMade,
        });
      }
    } catch (logErr) {
      console.error(`[${worker.name}] Failed to log failed event:`, logErr);
    }
  });

  const interval = setInterval(async () => {
    try {
      let status = "healthy";
      
      // Dynamically determine if worker is experiencing slowdown based on FailureRule DB flag
      const { shouldFail } = await import("./failure.service");
      const isSlow = await shouldFail("worker_slowdown");
      if (isSlow && worker.name === "payment_processing") {
        status = "slow";
      }

      await WorkerHeartbeat.findOneAndUpdate(
        { workerName: `${worker.name}-worker`, queueName: worker.name },
        {
          status,
          lastSeenAt: new Date(),
          activeJobs,
          $inc: {
            processedToday: processedCount,
            failedToday: failedCount,
          },
        },
        { upsert: true }
      );

      processedCount = 0;
      failedCount = 0;
    } catch (heartbeatErr) {
      console.error(`[${worker.name}] Failed sending heartbeat:`, heartbeatErr);
    }
  }, 10000);

  worker.on("closed", async () => {
    clearInterval(interval);
    try {
      await WorkerHeartbeat.findOneAndUpdate(
        { workerName: `${worker.name}-worker`, queueName: worker.name },
        { status: "offline", lastSeenAt: new Date(), activeJobs: 0 }
      );
    } catch (err) {
      console.error(`[${worker.name}] Failed to mark worker offline on close:`, err);
    }
  });
}
