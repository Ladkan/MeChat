import { useEffect, useState } from "react"

type Room = {
    id: string;
    creatorId: string;
    name: string;
    createdAt: number;
}

export function Rooms(){

    const [rooms, setRooms] = useState<Room[]>([])

    useEffect(() => {
        fetch("http://localhost:8000/api/rooms", {credentials: "include"})
            .then((r) => r.json())
            .then((data) => setRooms(data))
    },[])

    return(
        <div className="w-65.5 shrink-0 bg-[#13161b] rounded-2xl border border-solid flex border-[#232830] overflow-x-hidden">
            <div className="pt-3.5 px-3.5 pb-2.5 border-b border-solid border-b-[#232830] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                    <h1 className="font-bold text-xs text-[#4e5668]">Rooms</h1>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5">
                {rooms.map((r) => (
                    <div className="flex items-center py-2 px-2.5 rounded-lg cursor-pointer"> 
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-[#eef0f4] overflow-hidden items-center flex">
                                {r.name}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}