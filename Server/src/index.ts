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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use("/api/auth", toNodeHandler(auth))

app.use(express.json())

app.get("/api/rooms/:roomId/messages", async (req, res) => {
    const session = await auth.api.getSession({ headers: req.headers as any })
    if(!session) return res.status(401).json({ error: "Unauthorized" })

    const messages = await db.query.message.findMany({
        where: eq(message.roomId, req.params.roomId),
        with: { user: { columns: {name: true} } },
        orderBy: (m, {asc}) => [asc(m.createdAt)],
    })

    res.json(messages)
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

})

httpServer.listen(8000, () => console.log("Server running on :8000"))