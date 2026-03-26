import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { socket } from "~/lib/socket";
import type { Notification } from "~/utils/types";

const SERVER = "http://localhost:8000";

interface NotificationsProps {
  onRoomSelect: (roomId: string) => void;
}

export function Notifications({ onRoomSelect }: NotificationsProps) {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => !n.read).length;

  useEffect(() => {
    fetch(`${SERVER}/api/notifications`, { credentials: "include" })
      .then((r) => r.json())
      .then(setNotifs);
  }, []);

  useEffect(() => {
    socket.on("notification", (notif: Notification) => {
      setNotifs((prev) => [{ ...notif, read: false }, ...prev]);

      showToast(notif);
    });

    return () => { socket.off("notification"); };
  }, []);


  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await fetch(`${SERVER}/api/notifications/read`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [] }),
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = async (notif: Notification) => {

    await fetch(`${SERVER}/api/notifications/read`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [notif.id] }),
    });

    setNotifs((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );

    onRoomSelect(notif.roomId);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          open ? "bg-[#1a1e25] text-[#eef0f4]" : "text-[#4e5668] hover:bg-[#1a1e25] hover:text-[#eef0f4]"
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e8ff47] text-[#0d0f12] text-[9px] font-black flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#13161b] border border-[#232830] rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

          <div className="flex items-center justify-between px-4 py-3 border-b border-[#232830]">
            <span className="text-[13px] font-bold text-[#eef0f4]"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-[10px] bg-[#e8ff47]/10 text-[#e8ff47] border border-[#e8ff47]/20 px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-[#4e5668] hover:text-[#a0a8b8] transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-90 overflow-y-auto divide-y divide-[#232830]
            [&::-webkit-scrollbar]:w-0.75
            [&::-webkit-scrollbar-thumb]:bg-[#232830]">
            {notifs.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-[#4e5668]">
                No notifications yet
              </div>
            )}

            {notifs.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`w-full text-left px-4 py-3 hover:bg-[#1a1e25] transition-colors flex gap-3 items-start ${
                  !notif.read ? "bg-[#e8ff47]/3" : ""
                }`}
              >
                <div className="mt-1.5 shrink-0">
                  {!notif.read
                    ? <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] block" />
                    : <span className="w-1.5 h-1.5 rounded-full bg-transparent block" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[#eef0f4] leading-snug">
                    <span className="font-semibold text-[#47c8ff]">{notif.mentionedBy}</span>
                    {" mentioned you in "}
                    <span className="font-semibold text-[#e8ff47]">#{notif.roomName}</span>
                  </p>
                  <p className="text-[11px] text-[#4e5668] truncate mt-0.5 italic">
                    "{notif.preview}"
                  </p>
                  <p className="text-[10px] text-[#4e5668] mt-1">
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function showToast(notif: Notification) {
  const toast = document.createElement("div");
  toast.className = [
    "fixed top-5 right-5 z-[100]",
    "bg-[#13161b] border border-[#e8ff47]/30 rounded-xl",
    "px-4 py-3 shadow-2xl shadow-black/50",
    "flex items-start gap-3 max-w-sm",
    "animate-in slide-in-from-bottom-3 fade-in duration-200",
  ].join(" ");

  toast.innerHTML = `
    <div class="w-8 h-8 rounded-lg bg-[#e8ff47]/10 flex items-center justify-center shrink-0 mt-0.5">
      <span class="text-sm">🔔</span>
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-[12px] font-semibold text-[#eef0f4]">
        ${notif.mentionedBy} mentioned you
      </p>
      <p class="text-[11px] text-[#4e5668] truncate mt-0.5">
        in #${notif.roomName}
      </p>
    </div>
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}