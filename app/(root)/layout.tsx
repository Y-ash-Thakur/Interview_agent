import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Premium Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-200/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

      {/* Sticky Blur Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.05] bg-[#090a0f]/50 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto max-w-7xl flex items-center justify-between h-16 px-6 sm:px-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/10 group-hover:border-primary-200/30 transition-all duration-300">
              <Image 
                src="/logo.svg" 
                alt="PrepWise Logo" 
                width={22} 
                height={18} 
                className="group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-primary-100 to-primary-200 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              PrepWise
            </span>
          </Link>

          {/* Clean status badge */}
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-200/10 text-primary-200 border border-primary-200/25">
              <span className="size-1.5 rounded-full bg-primary-200 animate-pulse" />
              Live AI Interviewer
            </span>
          </div>
        </div>
      </header>

      {/* Page Content Container */}
      <main className="flex-1 mx-auto w-full max-w-7xl flex flex-col gap-10 py-10 px-6 sm:px-16 animate-fadeIn">
        {children}
      </main>
    </div>
  );
};

export default Layout;
