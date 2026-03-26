import { Router } from "express";
import { db } from "../db/client";
import { message, room, user } from "../db/schema";
import { auth } from "../lib/auth";
import { cleanInput } from "../lib";
import { eq, and, desc, Equal, inArray } from "drizzle-orm";
import { io } from "..";
import { log } from "../lib/logger";

const router = Router()

router.get("/rooms", async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const rooms = await db.select().from(room);

  res.json(rooms);
});

router.post("/rooms", async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { name } = req.body;

  const sanitized_name = cleanInput(name);

  if (!sanitized_name)
    return res.status(400).json({ error: "Room name is required" });

  const userExisting = await db
    .select()
    .from(room)
    .where(eq(room.creatorId, session.user.id));
  if (userExisting.length !== 0)
    return res.status(409).json({ error: "User already created room" });

  const existing = await db
    .select()
    .from(room)
    .where(eq(room.name, sanitized_name));

  if (existing.length !== 0)
    return res.status(409).json({ error: "Room already exists" });

  const newRoom = {
    id: crypto.randomUUID(),
    creatorId: session.user.id,
    name: sanitized_name,
    createdAt: new Date(),
  };

  await db.insert(room).values(newRoom);

  io.emit("room_created", newRoom);

  log({
    category: "room",
    action: "room_created",
    userId: session.user.id,
    meta: { name: sanitized_name, id: newRoom.id },
  });
  res.status(201).json(newRoom);
});

router.get("/rooms/:roomId", async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const roomData = await db
    .select()
    .from(room)
    .where(eq(room.id, req.params.roomId));

  res.json(roomData);
});

router.get("/rooms/:roomId/messages", async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const messages = await db
    .select({
      id: message.id,
      roomId: message.roomId,
      userId: message.userId,
      content: message.content,
      createdAt: message.createdAt,
      deletedAt: message.deletedAt ?? null,
      sender: user.name,
      isBot: user.isBot,
    })
    .from(message)
    .innerJoin(user, eq(message.userId, user.id))
    .where(eq(message.roomId, req.params.roomId))
    .orderBy(message.createdAt);

  res.json(messages);
});

export default router