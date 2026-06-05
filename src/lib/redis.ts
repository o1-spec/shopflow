import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("Please define REDIS_URL in .env.local");
}

export const redisConnectionOptions = {
  url: REDIS_URL,
  maxRetriesPerRequest: null,
};

export function createRedisConnection() {
  return new IORedis(REDIS_URL!, {
    maxRetriesPerRequest: null,
  });
}
