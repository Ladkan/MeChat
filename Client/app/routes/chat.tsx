import { useEffect, useState, useRef } from "react";
import { useSession, signOut, authClient } from "../lib/auth-client";
import { socket } from "../lib/socket";
import { redirect, useNavigate } from "react-router";
import type { Route } from "../+types/root";

type Message = {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
};

const ROOM_ID = "Fc5Oh7BohRDSTMEXGIGYA91BLOXSctCB";

export async function clientLoader(_: Route.ClientLoaderArgs) {
    const session = await authClient.getSession();
    if (!session.data) throw redirect("/login");
    return { user: session.data.user };
}

export default function Chat({ loaderData }: Route.ComponentProps) {
    const { data: session } = useSession();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Connect socket and join room once component mounts
      socket.connect();
      
      socket.on("connect", () =>{
        socket.emit("join_room", ROOM_ID);
      })

      // Load message history
      fetch(`http://localhost:8000/api/rooms/${ROOM_ID}/messages`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((data) => setMessages(data));

      socket.on("receive_message", (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on("user_typing", ({ name }: { name: string }) => {
        setIsTyping(name);
        setTimeout(() => setIsTyping(null), 2000);
      });

      return () => {
        socket.off("receive_message");
        socket.off("user_typing");
        socket.disconnect();
      };
    }, [ROOM_ID]);

    // Auto-scroll to latest message
    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
      if (!input.trim()) return;

      console.log("Socket connected:", socket.connected);

      socket.emit("send_message", { roomId: ROOM_ID, content: input });
      setInput("");
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      socket.emit("typing", { roomId: ROOM_ID });
    };

    const handleLogout = async () => {
      await signOut();
      navigate("/login");
    };

    return (
      <div>
        <header>
          <span>Logged in as {session?.user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </header>

        <div style={{ height: "400px", overflowY: "auto" }}>
          {messages.map((m) => (
            <p key={m.id}>
              <b>{m.sender}</b>: {m.content}
            </p>
          ))}
          {isTyping && <p><i>{isTyping} is typing...</i></p>}
          <div ref={bottomRef} />
        </div>

        <input
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    );
}