/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from "nanoid";
import Mustache from "mustache";

/**
 * Generate a unique ID with a type prefix
 * */
export function generateId(type: string): string {
  return `${type}-${nanoid()}`;
}

// Replace {{variables}} with actual data
export const replaceVariables = (
  text: string,
  data: Record<string, any>
): string => {
  return Mustache.render(text, data);
};
