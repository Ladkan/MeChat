interface TypingIndicatorProps {
  isTyping: string | undefined;
}

export function TypingIndicator({ isTyping }: TypingIndicatorProps) {
  return (
    <div className="flex gap-2.5 items-end">
      <div className="w-7 h-7 rounded-lg bg-[#1a1e25] shrink-0 flex items-center justify-center">
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#4e5668"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] text-[#4e5668] px-1 italic">
          {isTyping} is typing...
        </span>
        <div className="bg-[#1e2330] px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4e5668] animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#4e5668] animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#4e5668] animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
