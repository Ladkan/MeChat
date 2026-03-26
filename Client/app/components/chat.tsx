import { useEffect, useReducer, useRef, useState } from "react";
import { useSession } from "~/lib/auth-client";
import { socket } from "~/lib/socket";
import { Message } from "./message";
import type { MessageType } from "~/utils/types";
import { EmptyRoom } from "./empty_room";
import { TypingIndicator } from "./typing_indicator";

interface ChatProps {
  roomId: string | null;
}

type State = {
  input: string;
  isTyping: string | null;
  roomName: string;
}

const initialState: State = {
  input: "",
  isTyping: null,
  roomName: "",
}

function reducer(state: State, action: Partial<State>): State {
  return { ...state, ...action }
}

export function Chat({ roomId }: ChatProps) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { data: session } = useSession();
  const currentUser = session?.user.name;
  const [messages, setMessages] = useState<MessageType[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { input, isTyping, roomName } = state

  useEffect(() => {
    if (!roomId) return;

    fetch(`http://localhost:8000/api/rooms/${roomId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((r) => dispatch({ roomName: r[0].name }));

    inputRef.current?.focus();
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    setMessages([])

    socket.connect();

    socket.emit("leave_room", roomId);

    const onConnect = () => socket.emit("join_room", roomId);

    const onMessage = (msg: MessageType) =>
      setMessages((prev) => [...prev, msg]);

    const onTyping = ({ name }: { name: string }) => {
      dispatch({ isTyping: name })
      setTimeout(() => dispatch({ isTyping: null }), 2000);
    };

    const onDelete = ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content: "[Deleted by user]",
                deletedAt: new Date().toISOString(),
              }
            : m,
        ),
      );
    };

    socket.on("connect", onConnect);
    socket.on("receive_message", onMessage);
    socket.on("user_typing", onTyping);
    socket.on("message_deleted", onDelete);

    fetch(`http://localhost:8000/api/rooms/${roomId}/messages`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setMessages(data));

    return () => {
      socket.off("connect", onConnect);
      socket.off("receive_message", onMessage);
      socket.off("user_typing", onTyping);
      socket.off("message_deleted", onDelete);
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = () => {
    if (!input.trim()) return;

    console.log("Socket connected:", socket.connected);

    socket.emit("send_message", { roomId: roomId, content: input });
    dispatch({ input: "" })
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    dispatch({ input: val })
    socket.emit("typing", { roomId: roomId });
  };

  const deleteMessage = async (messageId: string) => {
    const res = await fetch(`http://localhost:8000/api/messages/${messageId}`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) console.error("Faild to delete message.");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) sendMessage();
  };

  if (!roomId) {
    return <EmptyRoom />;
  }

  return (
    <div className="flex-1 flex flex-col bg-[#13161b] border border-[#232830] rounded-2xl overflow-hidden min-w-0">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#232830] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#e8ff47]/10 flex items-center justify-center shrink-0">
          <span className="text-[14px] font-black text-[#e8ff47]">#</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2
            className="text-[14px] font-bold text-[#eef0f4] leading-none truncate"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {roomName || roomId}
          </h2>
          <p className="text-[11px] text-[#4e5668] mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3ddc84] mr-1.5 mb-px" />
            Live
          </p>
        </div>
        <button className="w-8 h-8 rounded-lg text-[#4e5668] hover:text-[#a0a8b8] hover:bg-[#1a1e25] flex items-center justify-center transition-all">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 [&::-webkit-scrollbar]:w-0.75 [&::-webkit-scrollbar-thumb]:bg-[#232830] [&::-webkit-scrollbar-thumb]:rounded-full">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-[#4e5668]">
              No messages yet — say hello! 👋
            </p>
          </div>
        )}

        {messages.map((m, i) => (
            <Message
              key={m.id}
              data={m}
              currentUser={currentUser}
              index={i}
              onDeleteMessage={deleteMessage}
              messages={messages} />
        ))}

        {isTyping && <TypingIndicator isTyping={isTyping} />}

        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-3 border-t border-[#232830] shrink-0">
        <div className="relative">
          <div className="flex items-center gap-2 bg-[#1a1e25] border border-[#232830] focus-within:border-[#e8ff47]/30 rounded-xl px-3.5 py-1.5 transition-colors">
            <input
              ref={inputRef}
              className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-[#eef0f4] placeholder:text-[#4e5668] py-1.5"
              placeholder={`Message #${roomName || roomId}`}
              value={input}
              onChange={handleTyping}
              onKeyDown={handleKeyDown}
            />

            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-8 h-8 rounded-lg bg-[#e8ff47] text-[#0d0f12] flex items-center justify-center hover:bg-[#d4eb3a] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-[10px] text-[#4e5668] mt-1.5 px-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
