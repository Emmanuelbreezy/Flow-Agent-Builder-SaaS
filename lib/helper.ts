/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from "nanoid";
import crypto from "crypto";
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

// Encryption
const ALGO = "aes-256-gcm";
const SECRET = process.env.MCP_SECRET_KEY!; // 32 bytes

export function encrypt(key: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(SECRET, "hex"), iv);

  const encrypted = Buffer.concat([cipher.update(key, "utf8"), cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}:${cipher
    .getAuthTag()
    .toString("hex")}`;
}

export function decrypt(payload: string) {
  const [iv, data, tag] = payload.split(":");
  const decipher = crypto.createDecipheriv(
    ALGO,
    Buffer.from(SECRET, "hex"),
    Buffer.from(iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(tag, "hex"));

  return decipher.update(Buffer.from(data, "hex")) + decipher.final("utf8");
}
