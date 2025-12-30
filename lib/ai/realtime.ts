import { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { UIMessageChunk } from "ai";
import z from "zod/v4";
import { redis } from "./redis";
//import { redis } from "./redis";

export const schema = {
  workflow: {
    chunk: z.any() as z.ZodType<UIMessageChunk>,
    error: z.any() as z.ZodType<Error>,
  },
};

export const realtime = new Realtime({ schema, redis });
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;
