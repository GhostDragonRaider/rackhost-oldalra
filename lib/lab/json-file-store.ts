import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export function labDataPath(filename: string): string {
  return path.join(DATA_DIR, filename);
}

export function readJsonFile<T>(filename: string, fallback: T): T {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = labDataPath(filename);
  if (!fs.existsSync(file)) {
    writeJsonFile(filename, fallback);
    return structuredClone(fallback);
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as T;
    return parsed ?? structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

export function writeJsonFile<T>(filename: string, data: T): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = labDataPath(filename);
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, file);
}

export function newLabId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
