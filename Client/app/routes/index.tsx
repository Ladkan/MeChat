import { Rooms } from "~/components/rooms";
import { Chat } from "~/components/chat";
import { useState } from "react";
import type { Route } from "./+types";
import { authClient } from "~/lib/auth-client";
import { redirect } from "react-router";

export async function clientLoader(_: Route.ClientLoaderArgs) {
    const session = await authClient.getSession();
    if (!session.data) throw redirect("/login");
    return session.data
}

export default function Home({ loaderData }: Route.ComponentProps) {
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  return (
    <main className="flex flex-1 overflow-hidden p-2.5 gap-2.5">
      <Rooms activeRoomId={activeRoomId} onRoomSelect={setActiveRoomId} />
      <Chat roomId={activeRoomId} currentUserId={loaderData.user.id} />
    </main>
  )
}
