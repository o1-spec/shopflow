"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queuewatchLogger = void 0;
exports.monitorQueue = monitorQueue;
const bullmq_1 = require("bullmq");
let sdkOptions = null;
const eventQueue = [];
let batchTimeout = null;
function monitorQueue(queue, options) {
    sdkOptions = options;
    if (!options.projectId || !options.apiKey) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[QueueWatch SDK] WARNING: Missing required configuration parameters. projectId: "${options.projectId}", apiKey: "${options.apiKey ? '***' : ''}". SDK will fail to send telemetry.`);
        }
    }
    try {
        const endpoint = options.endpoint || 'http://localhost:3001';
        const queueName = options.queueName || queue.name;
        // Send worker heartbeat in the background
        setInterval(() => {
            sendPayload('/api/ingest/heartbeat', {
                workerId: `worker_${queueName}_sdk`,
                queueName: queueName,
                status: 'healthy',
                timestamp: Date.now(),
                projectId: options.projectId,
            });
        }, 15000).unref?.();
        // Hook onto QueueEvents
        const connectionOpts = options.connection || queue.opts.connection;
        const queueEvents = new bullmq_1.QueueEvents(queue.name, { connection: connectionOpts });
        queueEvents.on('active', ({ jobId, prev }) => {
            enqueueEvent({
                type: 'job.active',
                queueName,
                jobId,
                status: 'active',
            });
        });
        queueEvents.on('completed', ({ jobId }) => {
            enqueueEvent({
                type: 'job.completed',
                queueName,
                jobId,
                status: 'completed',
                duration: 0,
            });
        });
        queueEvents.on('failed', ({ jobId, failedReason }) => {
            enqueueEvent({
                type: 'job.failed',
                queueName,
                jobId,
                status: 'failed',
                errorMessage: failedReason,
            });
        });
        queueEvents.on('stalled', ({ jobId }) => {
            enqueueEvent({
                type: 'job.stalled',
                queueName,
                jobId,
                status: 'stalled',
            });
        });
        queueEvents.on('delayed', ({ jobId, delay }) => {
            enqueueEvent({
                type: 'job.delayed',
                queueName,
                jobId,
                status: 'delayed',
            });
        });
        // Fail silently on error to keep the host app running
        queueEvents.on('error', (err) => {
            console.warn(`[QueueWatch SDK] QueueEvents listener warning: ${err.message}`);
        });
    }
    catch (e) {
        console.warn(`[QueueWatch SDK] Failed to initialize queue monitoring: ${e.message}`);
    }
}
function enqueueEvent(event) {
    eventQueue.push({
        ...event,
        projectId: sdkOptions?.projectId,
        timestamp: Date.now(),
    });
    if (!batchTimeout) {
        batchTimeout = setTimeout(() => {
            flushEvents();
        }, 1000);
    }
}
async function flushEvents() {
    batchTimeout = null;
    if (eventQueue.length === 0 || !sdkOptions)
        return;
    const eventsToSend = [...eventQueue];
    eventQueue.length = 0; // Clear queue
    await sendPayload('/api/ingest/events', {
        events: eventsToSend,
        projectId: sdkOptions.projectId
    });
}
async function sendPayload(path, payload) {
    if (!sdkOptions)
        return;
    try {
        const res = await fetch(`${sdkOptions.endpoint}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sdkOptions.apiKey}`,
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            // Fail silently, print debug only if explicitly desired
        }
    }
    catch (err) {
        // Fail silently: never block parent application threads
    }
}
exports.queuewatchLogger = {
    info(message, meta = {}) {
        logIngest('info', message, meta);
    },
    warn(message, meta = {}) {
        logIngest('warn', message, meta);
    },
    error(message, meta = {}) {
        logIngest('error', message, meta);
    },
};
function logIngest(level, message, meta) {
    if (!sdkOptions)
        return;
    const payload = {
        level,
        message,
        queueName: meta.queueName || sdkOptions.queueName,
        jobId: meta.jobId,
        traceId: meta.traceId || `tr_${Math.random().toString(36).substr(2, 9)}`,
        metadata: meta,
        timestamp: Date.now(),
        projectId: sdkOptions.projectId,
    };
    sendPayload('/api/ingest/logs', payload);
}
