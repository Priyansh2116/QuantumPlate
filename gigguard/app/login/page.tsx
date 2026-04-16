"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Phone, Lock, LogIn, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { saveSession, saveAdminSession } from "@/lib/client-auth";

type Tab = "worker" | "admin";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("worker");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Worker login
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // Admin login
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  async function handleWorkerLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      saveSession(data.id, data.name, data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUser, password: adminPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      saveAdminSession(data.token);
      // Also need a worker session to pass navbar — use a placeholder
      saveSession("admin", "Admin", data.token);
      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Admin login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 font-black text-2xl text-white">
            <Shield className="w-7 h-7 text-emerald-400" />
            Sign In to GigGuard
          </div>
          <p className="text-slate-400 text-sm">Your income protection dashboard</p>
        </div>

        {/* Tabs */}
        <div className="flex glass rounded-xl border border-white/5 p-1">
          <button
            onClick={() => { setTab("worker"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "worker" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" /> Worker Login
          </button>
          <button
            onClick={() => { setTab("admin"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "admin" ? "bg-red-500/20 text-red-300" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Admin Login
          </button>
        </div>

        {/* Worker Login Form */}
        {tab === "worker" && (
          <form onSubmit={handleWorkerLogin} className="glass rounded-2xl border border-white/5 p-8 space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Mobile Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 py-3 glass border border-white/10 rounded-xl text-slate-400 text-sm">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="tel" required value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/, ""))}
                    maxLength={10}
                    className="flex-1 glass border border-white/10 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass border border-white/10 focus:border-emerald-500/50 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder="Your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" /> {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-slate-500">
              New to GigGuard?{" "}
              <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Register here
              </Link>
            </p>
          </form>
        )}

        {/* Admin Login Form */}
        {tab === "admin" && (
          <form onSubmit={handleAdminLogin} className="glass rounded-2xl border border-red-500/20 p-8 space-y-5">
            <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-1">
              <ShieldAlert className="w-4 h-4" /> Insurer / Admin Access Only
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Username</label>
                <input
                  type="text" required value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full glass border border-white/10 focus:border-red-500/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                  placeholder="admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    className="w-full glass border border-white/10 focus:border-red-500/50 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/30 transition-all"
                    placeholder="Admin password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" /> {error}
              </p>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 disabled:opacity-50 text-red-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              {loading ? "Authenticating..." : "Access Admin Dashboard"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
