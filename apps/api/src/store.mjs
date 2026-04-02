import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const STORE_PATH = process.env.SIGNALOS_STORE_PATH
  ? resolve(process.env.SIGNALOS_STORE_PATH)
  : resolve(ROOT, "data/signalos.json");

export async function readStore() {
  const raw = await readFile(STORE_PATH, "utf8");
  return JSON.parse(raw);
}

export async function writeStore(data) {
  await writeFile(STORE_PATH, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowTimestamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("-") + ` ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
