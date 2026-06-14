"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { AUTH_KEY, USER_KEY, validateLogin } from "@/lib/auth";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem(AUTH_KEY);
    const user = localStorage.getItem(USER_KEY);
    if (auth === "true" && user) {
      setIsAuthenticated(true);
    }
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090d16]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Simulate a slight network delay for premium feel
    setTimeout(() => {
      const user = validateLogin(password);
      if (user) {
        localStorage.setItem(AUTH_KEY, "true");
        localStorage.setItem(USER_KEY, user);
        setIsAuthenticated(true);
      } else {
        setError(true);
        setPassword("");
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#090d16] text-white overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-950/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-950/40 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md p-8 z-10">
        {/* Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Top Decorative Border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          {/* Logo/Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 animate-pulse">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Secure Access</h2>
            <p className="text-slate-400 text-sm mt-1">Enter your password to access BOM Manager</p>
            <p className="text-slate-500 text-xs mt-2">Users: harigovind, rahul, shilna</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  className={`w-full px-4 py-3 bg-slate-950/70 border ${
                    error ? "border-red-500 focus:ring-red-500/20" : "border-slate-800 focus:ring-blue-500/20 focus:border-blue-500"
                  } rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 transition-all pr-12`}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && (
                <p className="text-red-400 text-xs mt-2 text-left animate-pulse">
                  Incorrect password. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Unlock Manager
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 space-y-1">
          <p>© {new Date().getFullYear()} BOM Manager. All rights reserved.</p>
          <p>Developed by <span className="text-slate-400 font-medium">harigovind</span></p>
        </div>
      </div>
    </div>
  );
}
