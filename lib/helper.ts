/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from "nanoid";
import Mustache from "mustache";

export function generateId(type: string): string {
  return `${type.toLowerCase()}-${nanoid(10)}`;
}

// Replace {{variables}} with actual data
export const replaceVariables = (
  text: string,
  data: Record<string, any>
): string => {
  return Mustache.render(text, data);
};

export function getValueFromOutputs(path: string, data: Record<string, any>) {
  return path.split(".").reduce((acc, key) => acc?.[key], data);
}

export const replace_Variables = (
  text: string,
  data: Record<string, any>
): string => {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
    const value = getValueFromOutputs(path.trim(), data);
    if (value === undefined) return "undefined";
    if (typeof value === "string") return JSON.stringify(value); // adds quotes
    return String(value);
  });
};
