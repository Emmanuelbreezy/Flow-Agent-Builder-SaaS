import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID with a type prefix
 * @param type - The type prefix for the ID (e.g., 'node', 'edge', 'agent')
 * @returns A string in the format: type-nanoid() (e.g., 'node-a1b2c3d4')
 */
export function generateId(type: string): string {
  return `${type}-${nanoid()}`;
}
