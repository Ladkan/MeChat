import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router"
import { signOut, useSession } from "~/lib/auth-client"

export function Header() {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const [showModal, setShowModal] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut()
    setLoggingOut(false)
    setShowUserMenu(false)
    navigate("/login")
  }

const closeModal = () => {
    setShowModal(false);
    setRoomName("");
    setCreateError("");
  };

    const createRoom = async () => {
        if(!roomName) return
        setCreating(true);
        setCreateError("")

        const res = await fetch("http://localhost:8000/api/rooms", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: roomName })
        })

        const data = await res.json()
        setCreating(false);

        if(!res.ok){
            setCreateError(data.error ?? "Faild to create room")
            return
        }

        closeModal()
    }

  return (
      <>
    <nav className="h-14 bg-[#13161b] border border-[#232830] flex items-center px-5 gap-1.5 shrink-0">

      <Link to="/" className="flex items-center gap-2 mr-3.5 text-[#e8ff47] font-extrabold text-lg tracking-[-0.5px] no-underline">
        <div className="w-7 h-7 rounded-lg bg-[#e8ff47] flex items-center justify-center shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0d0f12" strokeWidth="2.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        MeChat
      </Link>

      <div className="flex items-center gap-2 ml-auto">
        {session ? (
          <>
              <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#13161b] bg-[#e8ff47] hover:bg-[#d4eb3a] cursor-pointer ml-1.5 rounded-[7px] py-1.5 px-3 transition-colors">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Room
              </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu((v) => !v)}
                className={`flex items-center gap-2 py-1 px-2.5 border border-[#232830] cursor-pointer rounded-[20px] transition-colors ${
                  showUserMenu ? "bg-[#20252e]" : "bg-[#1a1e25] hover:bg-[#20252e]"
                }`}
              >
                <span className="font-medium text-sm text-[#a0a8b8]">
                  {session.user.name}
                </span>
                <svg
                  width="11" height="11" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  className={`text-[#4e5668] transition-transform duration-200 ${showUserMenu ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1e25] border border-[#232830] rounded-xl overflow-hidden shadow-2xl shadow-black/40 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2.5 border-b border-[#232830]">
                    <p className="text-[11px] text-[#4e5668]">Signed in as</p>
                    <p className="text-[12px] font-semibold text-[#a0a8b8] truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#ff6b6b] hover:bg-[#ff6b6b]/10 transition-colors duration-150 disabled:opacity-50"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {loggingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-[#a0a8b8] hover:text-[#eef0f4] transition-colors px-2 py-1">
              Login
            </Link>
            <Link to="/register" className="text-sm font-semibold text-[#13161b] bg-[#e8ff47] hover:bg-[#d4eb3a] transition-colors px-3 py-1.5 rounded-lg">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
 {showModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-[#13161b] border border-[#232830] rounded-2xl p-6 w-[340px] shadow-2xl shadow-black/50">

            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[15px] font-bold text-[#eef0f4]"
                style={{ fontFamily: "'Syne', sans-serif" }}>
                Create a Room
              </h3>
              <button
                onClick={closeModal}
                className="w-7 h-7 rounded-lg text-[#4e5668] hover:text-[#eef0f4] hover:bg-[#1a1e25] flex items-center justify-center transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-[#4e5668] mb-5">
              Pick a name.
            </p>

            <input
              autoFocus
              placeholder="e.g. dev-backend"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createRoom()}
              className="w-full bg-[#1a1e25] border border-[#232830] focus:border-[#e8ff47]/40 rounded-xl px-3.5 py-2.5 text-sm text-[#eef0f4] placeholder:text-[#4e5668] outline-none transition-colors mb-2"
            />

            {createError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-red-400 text-[12px]">{createError}</p>
              </div>
            )}

            <div className="flex items-center gap-1.5 mb-5">
              <span className="text-xs text-[#4e5668]">Preview:</span>
              <span className="text-xs font-bold text-[#e8ff47]">
                #{roomName || "my-room"}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={closeModal}
                className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-[#232830] text-[#4e5668] hover:text-[#eef0f4] hover:border-[#4e5668] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={createRoom}
                disabled={creating || !roomName.trim()}
                className="flex-1 px-3 py-2.5 text-sm rounded-xl bg-[#e8ff47] text-[#0d0f12] font-bold hover:bg-[#d4eb3a] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Room"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
  </>
  )
}