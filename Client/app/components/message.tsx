import { formatTime, senderColor } from "~/utils";
import type { MessageType } from "~/utils/types";

interface MessageProps {
  currentUser: string | undefined;
  data: any;
  index: number;
  onDeleteMessage: (messageId: string) => void;
  messages: MessageType[];
}

export function Message({
  currentUser,
  data,
  index,
  onDeleteMessage,
  messages,
}: MessageProps) {
  const isMe = data.sender === currentUser;
  const showSender =
    !isMe && (index === 0 || messages[index - 1]?.sender !== data.sender);
  const color = senderColor(data.sender);
  const isDeleted = data.deletedAt != null;
  return (
    <div
      key={data.id}
      className={`flex gap-2.5 items-end ${isMe ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`group flex flex-col gap-0.5 max-w-[62%] ${isMe ? "items-end" : "items-start"}`}
      >
        {showSender && !isMe && !isDeleted && (
          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-semibold px-1 ${color}`}>
              {data.sender}
            </span>
          </div>
        )}

        <div
          className={`flex items-center gap-1.5 ${isMe ? "flex-row-reverse" : ""}`}
        >
          <div
            className={`px-3.5 py-2 rounded-2xl text-[13.5px] leading-relaxed wrap-break-word ${
              isDeleted
                ? "bg-transparent border border-[#232830] text-[#4e5668] italic text-[12px]"
                : isMe
                  ? "bg-[#e8ff47] text-[#0d0f12] font-medium rounded-br-sm"
                  : "bg-[#1e2330] text-[#eef0f4] rounded-bl-sm"
            }`}
          >
            {data.content}
          </div>
          {isMe && !isDeleted && (
            <button
              onClick={() => onDeleteMessage(data.id)}
              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-[#1a1e25] border border-[#232830] text-[#4e5668] hover:text-[#ff6b6b] hover:border-[#ff6b6b]/30 hover:bg-[#ff6b6b]/10 flex items-center justify-center transition-all duration-150 shrink-0"
              title="Delete message"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          )}
        </div>
        <span className="text-[10px] text-[#4e5668] px-1">
          {data.createdAt ? formatTime(data.createdAt) : ""}
          {isDeleted && <span className="ml-1"> - deleted</span>}
        </span>
      </div>
    </div>
  );
}
