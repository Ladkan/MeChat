import { authClient } from "~/lib/auth-client";
import type { Route } from "./+types";
import { redirect } from "react-router";
import { useState } from "react";

export async function clientLoader(_: Route.ClientLoaderArgs) {
    const session = await authClient.getSession();
    if (!session.data) throw redirect("/login");
    return null;
}

export default function CreatRoom({ loaderData }: Route.ComponentProps){
    const [roomName, setRoomName] = useState("");
    const [createError, setCreateError] = useState("");
    const [creating, setCreating] = useState(false);
    
    const createRoom = async () => {
        if(!roomName) return
        setCreating(true);
        setCreateError("")

        const res = await fetch("http://localhost:8000/api/rooms", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: roomName })
        })

        const data = await res.json()
        setCreating(false);

        if(!res.ok){
            setCreateError(data.error ?? "Faild to create room")
            return
        }

        redirect("/")
    }

    return(
        <div style={{
            background: "#13161b", border: "1px solid #232830",
            borderRadius: 14, padding: 24, width: 360,
          }}>
            <h3 style={{ marginBottom: 16 }}>Create a Room</h3>

            <input
              autoFocus
              placeholder="room-name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createRoom()}
              style={{ width: "100%", marginBottom: 8 }}
            />

            {createError && (
              <p style={{ color: "red", fontSize: 12, marginBottom: 8 }}>{createError}</p>
            )}

            <p style={{ fontSize: 12, color: "#4e5668", marginBottom: 16 }}>
              Preview: <strong style={{ color: "#eee" }}>
                #{roomName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}
              </strong>
            </p>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={createRoom} disabled={creating || !roomName.trim()}>
                {creating ? "Creating..." : "Create Room"}
              </button>
            </div>
          </div>
    )
}