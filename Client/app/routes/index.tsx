import { Rooms } from "~/components/rooms";
import { Chat } from "~/components/chat";

export default function Home() {
  return (
    <main className="flex flex-1 overflow-hidden p-2.5 gap-2.5">
      <Rooms />
      <Chat />
    </main>
  )
}
