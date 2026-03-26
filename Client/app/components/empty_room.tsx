export function EmptyRoom(){
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