import { useEffect, useRef, useState } from "react"
import { socket } from "~/lib/socket"

interface ChatProps {
  roomId: string | null;
  currentUserId?: string;
}

type Message = {
  id: string;
  sender: string;
  content: string;
  createdAt: string;
}

const SENDER_COLORS = [
  "text-[#47c8ff]",
  "text-[#3ddc84]",
  "text-[#c471ed]",
  "text-[#ff8e53]",
  "text-[#e8ff47]",
  "text-[#f64f59]",
]

function senderColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length]
}

function formatTime(iso: string) {

  const today = new Date

  if(today.getDate() !== new Date(iso).getDate() )
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", day: '2-digit', month: '2-digit' })

  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function Chat({ roomId, currentUserId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [roomName, setRoomName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if(!roomId) return

    fetch(`http://localhost:8000/api/rooms/${roomId}`, {
      credentials: "include"
    })
      .then((r) => r.json())
      .then((r) => setRoomName(r[0].name))

    inputRef.current?.focus()
  },[roomId])

  useEffect(() => {
    if (!roomId) return

    setMessages([])

    socket.connect()

    socket.on("connect", () => {
      socket.emit("join_room", roomId)
    })

    fetch(`http://localhost:8000/api/rooms/${roomId}/messages`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setMessages(data))

    socket.on("receive_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.on("user_typing", ({ name }: { name: string }) => {
      setIsTyping(name)
      setTimeout(() => setIsTyping(null), 2000)
    })

    return () => {
      socket.off("receive_message")
      socket.off("user_typing")
      socket.disconnect()
    }
  }, [roomId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return

    console.log("Socket connected:", socket.connected)

    socket.emit("send_message", { roomId: roomId, content: input })
    setInput("")
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    socket.emit("typing", { roomId: roomId })
  }

  if (!roomId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#13161b] border border-[#232830] rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-[#1a1e25] flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4e5668"
            strokeWidth="1.5"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-[#a0a8b8]">
            No room selected
          </p>
          <p className="text-xs text-[#4e5668] mt-1">
            Pick a room from the sidebar to start chatting
          </p>
        </div>
      </div>
    )
  }

  return(
    <div className="flex-1 flex flex-col bg-[#13161b] border border-[#232830] rounded-2xl overflow-hidden min-w-0">

      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#232830] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#e8ff47]/10 flex items-center justify-center shrink-0">
          <span className="text-[14px] font-black text-[#e8ff47]">#</span>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-bold text-[#eef0f4] leading-none truncate"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            {roomName || roomId}
          </h2>
          <p className="text-[11px] text-[#4e5668] mt-0.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#3ddc84] mr-1.5 mb-px" />
            Live
          </p>
        </div>
        <button className="w-8 h-8 rounded-lg text-[#4e5668] hover:text-[#a0a8b8] hover:bg-[#1a1e25] flex items-center justify-center transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 [&::-webkit-scrollbar]:w-0.75 [&::-webkit-scrollbar-thumb]:bg-[#232830] [&::-webkit-scrollbar-thumb]:rounded-full">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-[#4e5668]">No messages yet — say hello! 👋</p>
          </div>
        )}

        {messages.map((m, i) => {
          const isMe = m.sender === currentUserId
          const showSender = !isMe && (i === 0 || messages[i - 1]?.sender !== m.sender)
          const color = senderColor(m.sender)

          return (
            <div key={m.id} className={`flex gap-2.5 items-end ${isMe ? "flex-row-reverse" : ""}`}>

              <div className={`flex flex-col gap-0.5 max-w-[62%] ${isMe ? "items-end" : "items-start"}`}>
                {showSender && !isMe && (
                  <span className={`text-[11px] font-semibold px-1 ${color}`}>
                    {m.sender}
                  </span>
                )}

                <div className={`px-3.5 py-2 rounded-2xl text-[13.5px] leading-relaxed wrap-break-word ${
                  isMe
                    ? "bg-[#e8ff47] text-[#0d0f12] font-medium rounded-br-sm"
                    : "bg-[#1e2330] text-[#eef0f4] rounded-bl-sm"
                }`}>
                  {m.content}
                </div>

                <span className="text-[10px] text-[#4e5668] px-1">
                  {m.createdAt ? formatTime(m.createdAt) : ""}
                </span>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div className="flex gap-2.5 items-end">
            <div className="w-7 h-7 rounded-lg bg-[#1a1e25] shrink-0 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4e5668" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[11px] text-[#4e5668] px-1 italic">{isTyping} is typing...</span>
              <div className="bg-[#1e2330] px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4e5668] animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#4e5668] animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#4e5668] animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-[#232830] shrink-0">
        <div className="flex items-center gap-2 bg-[#1a1e25] border border-[#232830] focus-within:border-[#e8ff47]/30 rounded-xl px-3.5 py-1.5 transition-colors">
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-[#eef0f4] placeholder:text-[#4e5668] py-1.5"
            placeholder={`Message #${roomName || roomId}`}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              socket.emit("typing", { roomId })
            }}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-lg bg-[#e8ff47] text-[#0d0f12] flex items-center justify-center hover:bg-[#d4eb3a] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-[#4e5668] mt-1.5 px-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )

}
