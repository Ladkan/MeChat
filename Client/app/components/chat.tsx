import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSession } from "~/lib/auth-client";
import { socket } from "~/lib/socket";

interface ChatProps {
  roomId: string | null;
}

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

export function Chat({ roomId }: ChatProps){
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [room, setRoom] = useState<Room>()

        useEffect(() => {

          if(!roomId) return

          setMessages([]);

          socket.connect();
          
          socket.on("connect", () =>{
            socket.emit("join_room", roomId);
          })
          
          fetch(`http://localhost:8000/api/rooms/${roomId}`, {
            credentials: "include"
          })
            .then((r) => r.json())
            .then((data) => setRoom(data))
            

          fetch(`http://localhost:8000/api/rooms/${roomId}/messages`, {
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
        }, [roomId]);
    
        useEffect(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, [messages]);
    
        const sendMessage = () => {
          if (!input.trim()) return;
    
          console.log("Socket connected:", socket.connected);
    
          socket.emit("send_message", { roomId: roomId, content: input });
          setInput("");
        };
    
        const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
          setInput(e.target.value);
          socket.emit("typing", { roomId: roomId });
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

                  <input
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
        </div>
        </div>
    )
}