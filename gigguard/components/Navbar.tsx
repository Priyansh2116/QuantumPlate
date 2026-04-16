"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Shield, LayoutDashboard, FileText, AlertTriangle,
  Map, LogOut, LogIn, UserPlus, ChevronDown, Menu, X, User,
} from "lucide-react";
import { getSession, clearSession, getAdminSession, clearAdminSession } from "@/lib/client-auth";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/policies", label: "Policies", icon: FileText },
  { href: "/claims", label: "Claims", icon: AlertTriangle },
  { href: "/map", label: "Risk Map", icon: Map },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<{ workerId: string; name: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(getSession());
    setIsAdmin(!!getAdminSession());
  }, [pathname]);

  function handleSignOut() {
    clearSession();
    clearAdminSession();
    setSession(null);
    setIsAdmin(false);
    setUserMenuOpen(false);
    router.push("/");
  }

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-[#050b15]/80">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-2 font-black text-lg text-white">
            <Shield className="w-5 h-5 text-emerald-400" /> GigGuard
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-[#050b15]/80">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-lg text-white flex-shrink-0">
          <Shield className="w-5 h-5 text-emerald-400" />
          GigGuard
        </Link>

        {/* Desktop nav links — only when logged in */}
        {session && (
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href} href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === href
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/admin"
                    ? "bg-red-500/20 text-red-300"
                    : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">

          {session ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 glass border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-sm transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-slate-300 hidden sm:block max-w-28 truncate">{session.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 glass border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20">
                    <div className="px-4 py-3 border-b border-white/5">
                      <div className="text-sm font-semibold text-white truncate">{session.name}</div>
                      <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Protected · Worker Account
                      </div>
                    </div>
                    {/* Mobile nav links inside dropdown */}
                    <div className="md:hidden">
                      {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href} href={href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <Icon className="w-3.5 h-3.5 text-slate-500" /> {label}
                        </Link>
                      ))}
                    </div>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white glass border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-xl transition-all"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 text-sm text-black font-bold bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 rounded-xl transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" /> Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          {session && (
            <button
              className="md:hidden glass border border-white/10 p-1.5 rounded-lg text-slate-400"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {menuOpen && session && (
        <div className="md:hidden border-t border-white/5 bg-[#050b15]/95 px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href} href={href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === href ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
