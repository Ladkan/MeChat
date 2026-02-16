import "dotenv/config"
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import { db } from "./db/client";
import { message, room, user } from "./db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173", credentials: true },
})

const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,               
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use("/api/auth", toNodeHandler(auth))

app.use(express.json())

app.get("/api/rooms", async (req, res) => {
    const session = await auth.api.getSession({ headers: req.headers as any })
    if(!session) return res.status(401).json({ error: "Unauthorized" })

    const rooms = await db.select().from(room)

    res.json(rooms)
})

app.post("/api/rooms", async (req, res) => {
    const session = await auth.api.getSession({ headers: req.headers as any })
    if(!session) return res.status(401).json({ error: "Unauthorized" })

    const { name } = req.body

    if(!name)
        return res.status(400).json({ error: "Room name is required" })

    const userExisting = await db.select().from(room).where(eq(room.creatorId, session.user.id))
    if(userExisting.length !== 0) return res.status(409).json({ error: "User already created room" })

    const existing = await db.select().from(room).where(eq(room.name, name))
    console.log(existing)
    if(existing.length !== 0) return res.status(409).json({ error: "Room already exists" })

    const newRoom = {
        id: crypto.randomUUID(),
        creatorId: session.user.id,
        name,
        createdAt: new Date,
    }

    await db.insert(room).values(newRoom)

    res.status(201).json(newRoom)

})

app.get("/api/rooms/:roomId", async (req, res) =>{
    const session = await auth.api.getSession({ headers: req.headers as any })
    if(!session) return res.status(401).json({ error: "Unauthorized" })

    const roomData = await db.select().from(room).where(eq(room.id, req.params.roomId))

    res.json(roomData)
})

app.get("/api/rooms/:roomId/messages", async (req, res) => {
    const session = await auth.api.getSession({ headers: req.headers as any })
    if(!session) return res.status(401).json({ error: "Unauthorized" })

    const messages = await db.select({
        id: message.id,
        roomId: message.roomId,
        userId: message.userId,
        content: message.content,
        createdAt: message.createdAt,
        deletedAt: message.deletedAt ?? null,
        sender: user.name
    }).from(message)
        .innerJoin(user, eq(message.userId, user.id))
        .where(eq(message.roomId, req.params.roomId))
        .orderBy(message.createdAt)

    res.json(messages)
})

app.patch("/api/messages/:messageId", async (req, res) => {
    const session = await auth.api.getSession({ headers: req.headers as any })
    if(!session) return res.status(401).json({ error: "Unauthorized" })

    const { messageId } = req.params;

    const existing = await db.query.message.findFirst({
        where: eq(message.id, messageId)
    })

    if(!existing) return res.status(404).json({ error: "Message not found" })

    if(existing.userId !== session.user.id)
        return res.status(403).json({ error: "Forbidden" })


        await db.update(message).set({ content: "[Deleted by user]", deletedAt: new Date() }).where(eq(message.id, messageId))

    io.to(existing.roomId).emit("message_deleted", {
        messageId,
        roomId: existing.roomId,
    })

    res.json({ success: true })
})

io.use(async (socket, next) => {
    const session = await auth.api.getSession({
        headers: new Headers({ cookie: socket.handshake.headers.cookie || "" })
    })

    if(!session) return next(new Error("Unauthorized"))

    socket.data.user = session.user
    next()
})

io.on("connection", (socket) => {
    const user = socket.data.user

    socket.on("join_room", (roomId: string) => socket.join(roomId))

    socket.on("send_message", async ({ roomId, content }: { roomId: string; content: string }) =>{
        
        console.log("Received message:", { roomId, content, user: socket.data.user?.name });

        try{
            const newMessage = {
                id: randomUUID(),
                content,
                roomId,
                userId: user.id,
                createdAt: new Date(),
            }

            await db.insert(message).values(newMessage)
            console.log("Message saved to DB ✅");

            io.to(roomId).emit("receive_message", {
                ...newMessage,
                sender: user.name,
            })

            console.log("Message broadcast to room:", roomId, "✅");

        } catch(err){
            console.error("Failed to save message:", err);
        }
    })

    socket.on("typing", ({ roomId }: { roomId: string }) => {
        socket.to(roomId).emit("user_typing", {name: user.name})
    })

    socket.on("leave_room", (roomId: string) => {
        socket.leave(roomId);
    });

})

httpServer.listen(8000, () => console.log("Server running on :8000"))