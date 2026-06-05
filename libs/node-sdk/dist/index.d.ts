type QueueLike = {
    name: string;
    opts?: {
        connection?: any;
    };
};
export interface MonitorOptions {
    projectId: string;
    apiKey: string;
    queueName: string;
    endpoint: string;
    connection?: any;
}
export declare function monitorQueue(queue: QueueLike, options: MonitorOptions): void;
export declare const queuewatchLogger: {
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
};
export {};
