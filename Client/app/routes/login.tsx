import { useState } from "react"
import { useNavigate, Link, redirect } from "react-router"
import { authClient, signIn } from "../lib/auth-client"

export async function clientLoader() {
  const session = await authClient.getSession()
  if (session.data) throw redirect("/")
  return null
}

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const { error } = await signIn.email({ email, password })
    setLoading(false)
    if (error) setError(error.message ?? "Login failed")
    else navigate("/")
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] flex">

      <div className="hidden lg:flex w-[52%] flex-col relative overflow-hidden bg-[#0d0f12] border-r border-[#232830]">

        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(#e8ff47 1px, transparent 1px),
              linear-gradient(90deg, #e8ff47 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #e8ff47 0%, transparent 70%)" }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-95">

          <h2 className="text-[#eef0f4] font-black text-[1.75rem] leading-tight mb-1"
            style={{ fontFamily: "'Syne', sans-serif" }}>
            Welcome back
          </h2>
          <p className="text-[#4e5668] text-sm mb-8">
            Sign in to continue to your rooms.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-red-400 text-[13px]">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#4e5668]">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#13161b] border border-[#232830] focus:border-[#e8ff47]/40 rounded-xl px-4 py-3 text-sm text-[#eef0f4] placeholder:text-[#4e5668] outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#4e5668]">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#13161b] border border-[#232830] focus:border-[#e8ff47]/40 rounded-xl px-4 py-3 text-sm text-[#eef0f4] placeholder:text-[#4e5668] outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="mt-1.5 w-full bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-40 disabled:cursor-not-allowed text-[#0d0f12] font-bold text-[14px] py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#232830]" />
            <span className="text-[11px] text-[#4e5668] font-medium">or</span>
            <div className="flex-1 h-px bg-[#232830]" />
          </div>

          <p className="text-center text-[13px] text-[#4e5668]">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#e8ff47] font-semibold hover:text-[#d4eb3a] transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}