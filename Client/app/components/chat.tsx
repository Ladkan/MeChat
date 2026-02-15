import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSession } from "~/lib/auth-client";
import { socket } from "~/lib/socket";

type Message = {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
};

type Room = {
    id: string;
    creatorId: string;
    name: string;
    createdAt: number;
}

const ROOM_ID = "Fc5Oh7BohRDSTMEXGIGYA91BLOXSctCB";

export function Chat(){
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [room, setRoom] = useState<Room>()

        useEffect(() => {
          // Connect socket and join room once component mounts
          socket.connect();
          
          socket.on("connect", () =>{
            socket.emit("join_room", ROOM_ID);
          })
          
          fetch(`http://localhost:8000/api/rooms/${ROOM_ID}`, {
            credentials: "include"
          })
            .then((r) => r.json())
            .then((data) => setRoom(data))
            

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
    
    return(
        <div className="flex-1 bg-[#13161b] rounded-2xl overflow-hidden flex-col flex border border-solid border-[#232830]">
            <div className="px-5 py-3 border-b-[#232830] border-b flex items-center gap-3 shrink-0">
                <div className="flex items-center text-[#eef0f4]">
                    <span>{room?.name}</span>
                </div>
            </div>
        <div style={{ overflowY: "auto" }}>
          {messages.map((m) => (
            <p key={m.id}>
              <b>{m.sender}</b>: {m.content}
            </p>
          ))}
          {isTyping && <p><i>{isTyping} is typing...</i></p>}
          <div ref={bottomRef} />
        </div>
        </div>
    )
}