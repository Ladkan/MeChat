import { Rooms } from "~/components/rooms";
import { Chat } from "~/components/chat";
import { useState } from "react";

export default function Home() {
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  return (
    <main className="flex flex-1 overflow-hidden p-2.5 gap-2.5">
      <Rooms activeRoomId={activeRoomId} onRoomSelect={setActiveRoomId} />
      <Chat roomId={activeRoomId} />
    </main>
  )
}
