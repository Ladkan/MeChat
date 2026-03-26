import { Rooms } from "~/components/rooms";
import { Chat } from "~/components/chat";
import { useEffect, useState } from "react";
import type { Route } from "./+types";
import { authClient, useSession } from "~/lib/auth-client";
import { redirect } from "react-router";
import { Header } from "~/components/header";
import { socket } from "~/lib/socket";
import type { Room } from "~/utils/types";

export async function clientLoader(_: Route.ClientLoaderArgs) {
    const session = await authClient.getSession()
    if (!session.data) throw redirect("/login")

    const res = await fetch("http://localhost:8000/api/rooms", { credentials: "include" })
    const rooms = await res.json()

    return { rooms }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { rooms: initialRooms } = loaderData
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>(initialRooms)

  const handleRoomCreated = (newRoom: Room) => {
    setRooms((prev) => prev.find((r) => r.id === newRoom.id) ? prev : [...prev, newRoom])
    setActiveRoomId(newRoom.id)
  }

  useEffect(() => {
    socket.connect()
    return () => { socket.disconnect() }
  }, [])

  return (
    <>
    <Header onRoomCreated={handleRoomCreated} onRoomSelect={setActiveRoomId} />
    <main className="flex flex-1 overflow-hidden p-2.5 gap-2.5">
      <Rooms rooms={rooms} setRooms={setRooms} activeRoomId={activeRoomId} onRoomSelect={setActiveRoomId} />
      <Chat roomId={activeRoomId} />
    </main>
    </>
  )
}
