import { useEffect, useState } from "react"
import { socket } from "~/lib/socket";
import type { Room } from "~/utils/types";

interface RoomsProps {
  activeRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

export function Rooms({ activeRoomId, onRoomSelect, rooms, setRooms }: RoomsProps) {

  useEffect(() => {
    socket.on("room_created", (newRoom: Room) => {
      setRooms((prev) => prev.find((r) => r.id === newRoom.id) ? prev : [...prev, newRoom])
    })
    return () => { socket.off("room_created") }
  }, [])

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-[#13161b] border border-[#232830] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#4e5668]">
          Rooms
        </span>
      </div>

      <div
        className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5
          [&::-webkit-scrollbar]:w-0.75
          [&::-webkit-scrollbar-thumb]:bg-[#232830]
          [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {rooms.length === 0 && (
          <p className="text-xs text-[#4e5668] text-center py-6 px-4">
            No rooms yet — create one!
          </p>
        )}
        {rooms.map((room) => {
          const isActive = room.id === activeRoomId
          return (
            <button
              key={room.id}
              onClick={() => onRoomSelect(room.id)}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 relative group ${
                isActive
                  ? "bg-[#e8ff47]/10 text-[#eef0f4] font-semibold"
                  : "text-[#4e5668] hover:bg-[#1a1e25] hover:text-[#a0a8b8]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-4 bg-[#e8ff47] rounded-r-full" />
              )}
              <span
                className={`font-bold text-[13px] ${isActive ? "text-[#e8ff47]" : "text-[#4e5668] group-hover:text-[#4e5668]"}`}
              >
                #
              </span>
              <span className="truncate">{room.name}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )

}
