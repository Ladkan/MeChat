import { Link } from "react-router";
import { useSession } from "~/lib/auth-client";

export function Header(){
    const { data: session } = useSession();

    return(
        <nav className="h-14 bg-[#13161b] border border-[#232830] border-solid flex items-center px-5 gap-1.5 shrink-0">
            <div className="font-extrabold text-lg text-[#e8ff47] mr-3.5 items-center gap-2 tracking-[-0.5px]">
                MeChat
            </div>
            <div className="flex items-center gap-2 ml-auto">
                {session ? (
                    <>
                    <button className="flex items-center gap-1.5 text-[13px] font-semibold text-[#13161b] bg-[#e8ff47] cursor-pointer ml-1.5 rounded-[7px] py-1.5 px-3">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        New Room
                    </button>
                    <div className="flex bg-[#1a1e25] items-center py-1 px-2.5 border border-solid border-[#232830] cursor-pointer rounded-[20px]">
                        <span className="font-medium text-sm text-[#a0a8b8]">{session?.user.name}</span>
                    </div>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                ) }
            </div>
        </nav>
    )
}