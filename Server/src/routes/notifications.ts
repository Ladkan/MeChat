import { Router } from "express";
import { auth } from "../lib/auth";
import { db } from "../db/client";
import { notification, room } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";

const router = Router()

router.get("/notifications", async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const notifications = await db.query.notification.findMany({
    where: eq(notification.userId, session.user.id),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit: 50,
  });

  const enriched = await Promise.all(
    notifications.map(async (n) => {
      const roomRecord = await db.query.room.findFirst({
        where: eq(room.id, n.roomId),
      });
      return { ...n, roomName: roomRecord?.name ?? n.roomId };
    })
  );

  res.json(enriched);
});

router.patch("/notifications/read", async (req, res) => {
  const session = await auth.api.getSession({ headers: req.headers as any });
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { ids } = req.body as { ids: string[] };

  if (ids.length > 0) {
    await db
      .update(notification)
      .set({ read: true })
      .where(
        and(
          eq(notification.userId, session.user.id),
          inArray(notification.id, ids)
        )
      );
  } else {
    await db
      .update(notification)
      .set({ read: true })
      .where(eq(notification.userId, session.user.id));
  }

  res.json({ success: true });
});

export default router