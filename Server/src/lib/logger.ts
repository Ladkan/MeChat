import { db } from "../db/client";
import { auditlog } from "../db/schema";
import { randomUUID } from "crypto";

type Level = "info" | "warn" | "error"
type Category = "auth" | "bot" | "room" | "message" | "socket" | "server"

interface LogOptions {
    level?: Level;
    category: Category;
    action: string;
    userId?: string;
    meta?: Record<string, unknown>;
}

export async function log({
    level = "info",
    category,
    action,
    userId,
    meta,
}: LogOptions) : Promise<void> {
    const prefix = `[${category?.toUpperCase()}]`
    const msg = `${prefix} ${action}${meta ? " " + JSON.stringify(meta) : ""}`

    if(level === "error") console.error(msg)
    else if (level === "warn") console.warn(msg)
    else console.log(msg)

    db.insert(auditlog).values({
    id: randomUUID(),
    level,
    category,
    action,
    userId: userId ?? null,
    meta: meta ? JSON.stringify(meta) : null,
    createdAt: new Date(),
  }).run();
}