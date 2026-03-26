import { Router } from "express";
import { auth } from "../lib/auth";
import { db } from "../db/client";
import { message, notification } from "../db/schema";
import { eq } from "drizzle-orm";
import { io } from "..";
import { log } from "../lib/logger";

const router = Router()

router.patch("/messages/:messageId", async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { messageId } = req.params;

  const existing = await db.query.message.findFirst({
    where: eq(message.id, messageId),
  });

  if (!existing) return res.status(404).json({ error: "Message not found" });

  if (existing.userId !== session.user.id)
    return res.status(403).json({ error: "Forbidden" });

  await db
    .update(message)
    .set({ content: "[Deleted by user]", deletedAt: new Date() })
    .where(eq(message.id, messageId));

  await db.delete(notification).where(eq(notification.messageId, messageId))

  io.to(existing.roomId).emit("message_deleted", {
    messageId,
    roomId: existing.roomId,
  });

  log({
    category: "message",
    action: "message_deleted",
    userId: session.user.id,
    meta: { messageId, roomId: existing.roomId },
  });
  res.json({ success: true });
});

export default router