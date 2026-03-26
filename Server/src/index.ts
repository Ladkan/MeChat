import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { db } from "./db/client";
import { auditlog, message, notification, room, user } from "./db/schema";
import { eq, and, desc, Equal, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import helmet from "helmet";
//import { startBot, botStop } from "./bot";
import { log } from "./lib/logger";
import { extractMentionedUsers, cleanInput } from "./lib";
import roomsRouter from "./routes/rooms"
import messagesRouter from "./routes/messages"
import notificationRouter from "./routes/notifications"

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: "http://localhost:5173", credentials: true },
});

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(helmet());

app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());

app.use("/api", roomsRouter)
app.use("/api", messagesRouter)
app.use("/api", notificationRouter)


io.use(async (socket, next) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers({ cookie: socket.handshake.headers.cookie || "" }),
    });

    log({ category: "socket", action: "session_result", meta: { session } });
    if (!session) {
      log({
        level: "warn",
        category: "socket",
        action: "unauthorized_connection",
        meta: { ip: socket.handshake.address },
      });
      return next(new Error("Unauthorized"));
    }

    const fullUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    log({
      category: "socket",
      action: "client_connected",
      userId: fullUser?.id,
      meta: { name: fullUser?.name, socketId: socket.id },
    });

    socket.data.user = fullUser;
    next();
  } catch (err) {
    console.error("[Socket] getSession error:", err);
    next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user;

  socket.join(`user:${user.id}`)

  socket.on("join_room", async (roomId: string) => {
    socket.join(roomId);
    log({
      category: "room",
      action: "user_joined_room",
      userId: user.id,
      meta: { roomId, name: user.name },
    });
  });

  socket.on(
    "send_message",
    async ({ roomId, content }: { roomId: string; content: string }) => {
      log({
        category: "message",
        action: "message_received",
        userId: socket.data.user?.id,
        meta: { roomId, content },
      });

      try {
        const sanitized_content = cleanInput(content);

        if (sanitized_content.length === 0)
          throw new Error(`User ${user.name} tryid to send script message`);

        const newMessage = {
          id: randomUUID(),
          content: sanitized_content,
          roomId,
          userId: user.id,
          isBot: user.isBot,
          createdAt: new Date(),
        };

        await db.insert(message).values(newMessage);

        io.to(roomId).emit("receive_message", {
          ...newMessage,
          sender: user.name,
          isBot: user.isBot,
        });

        log({
          category: "message",
          action: "message_sent",
          userId: user.id,
          meta: { roomId, preview: content.slice(0, 40) },
        });

        const mentionedNames = await extractMentionedUsers(content);
        if (mentionedNames.length === 0) return;

        const allUsers = await db.query.user.findMany();
        const mentionedUsers = allUsers.filter(
          (u) =>
            mentionedNames.includes(u.name.toLowerCase()) && u.id !== user.id,
        );

        for (const mentionedUser of mentionedUsers) {
          const notif = {
            id: randomUUID(),
            userId: mentionedUser.id,
            roomId,
            messageId: newMessage.id,
            mentionedBy: user.name,
            read: false,
            createdAt: new Date(),
          };

          await db.insert(notification).values(notif);

          const roomRecord = await db.query.room.findFirst({
            where: eq(room.id, roomId),
          });

          io.to(`user:${mentionedUser.id}`).emit("notification", {
            id: notif.id,
            roomId,
            roomName: roomRecord?.name ?? roomId,
            mentionedBy: user.name,
            preview: content.slice(0, 60),
            createdAt: notif.createdAt,
          });

          await log({
            category: "message",
            action: "user_mentioned",
            userId: mentionedUser.id,
            meta: {
              mentionedBy: user.name,
              roomId,
              roomName: roomRecord?.name,
            },
          });
        }
      } catch (err) {
        console.error("Failed to save message:", err);
      }
    },
  );

  socket.on("typing", ({ roomId }: { roomId: string }) => {
    socket.to(roomId).emit("user_typing", { name: user.name });
  });

  socket.on("leave_room", (roomId: string) => {
    socket.leave(roomId);
    log({
      category: "room",
      action: "user_left_room",
      userId: user.id,
      meta: { roomId },
    });
  });

  socket.on("disconnect", (reason) => {
    log({
      category: "socket",
      action: "client_disconnected",
      userId: user.id,
      meta: { reason, name: user.name },
    });
  });
});

httpServer.listen(8000, () => {
  log({ category: "server", action: "server_started", meta: { port: 8000 } });
  //startBot();
});

async function Shutdown() {
  log({ level: "warn", category: "server", action: "server_shutdown" });
  //await botStop();
  httpServer.close(() => {
    log({ level: "warn", category: "server", action: "server_http_close" });
    process.exit(0);
  });
}

process.on("SIGINT", Shutdown);
process.on("SIGTERM", Shutdown);
