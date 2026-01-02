import { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { Redis } from "@upstash/redis";
import { UIMessageChunk } from "ai";
import z from "zod/v4";
//import { redis } from "./redis";

export const redis = Redis.fromEnv();

export const schema = {
  workflow: {
    chunk: z.any() as z.ZodType<UIMessageChunk>,
    // waitingForInput: z.object({
    //   eventId: z.string(),
    //   message: z.string(),
    // }),
    // inputResolved: z.object({
    //   eventId: z.string(),
    // }),
  },
};

export const realtime = new Realtime({ schema, redis });
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
