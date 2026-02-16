import { Rooms } from "~/components/rooms";
import { Chat } from "~/components/chat";
import { useState } from "react";
import type { Route } from "./+types";
import { authClient, useSession } from "~/lib/auth-client";
import { redirect } from "react-router";

export default function Home() {
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  return (
    <main className="flex flex-1 overflow-hidden p-2.5 gap-2.5">
      <Rooms activeRoomId={activeRoomId} onRoomSelect={setActiveRoomId} />
      <Chat roomId={activeRoomId} />
    </main>
  )
}
