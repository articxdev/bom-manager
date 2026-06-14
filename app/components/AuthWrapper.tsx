"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowRight, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { AUTH_KEY, USER_KEY, validateLogin, formatUserName } from "@/lib/auth";

const USER_PROFILES = [
  {
    username: "harigovind",
    initials: "HG",
    gradient: "from-violet-500 to-purple-600",
    textColor: "text-violet-600",
    borderColor: "border-violet-100 hover:border-violet-300",
    bgHover: "hover:bg-violet-50/30",
  },
  {
    username: "rahul",
    initials: "RA",
    gradient: "from-blue-500 to-indigo-600",
    textColor: "text-blue-600",
    borderColor: "border-blue-100 hover:border-blue-300",
    bgHover: "hover:bg-blue-50/30",
  },
  {
    username: "shilna",
    initials: "SH",
    gradient: "from-emerald-500 to-teal-600",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-100 hover:border-emerald-300",
    bgHover: "hover:bg-emerald-50/30",
  },
] as const;

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Custom states for interactive profile selection
  const [selectedUser, setSelectedUser] = useState<typeof USER_PROFILES[number] | null>(null);

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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
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

    // Blazing-fast response delay (80ms) for professional responsiveness
    setTimeout(() => {
      const validatedUser = validateLogin(password);
      if (validatedUser && selectedUser && validatedUser.toLowerCase() === selectedUser.username.toLowerCase()) {
        localStorage.setItem(AUTH_KEY, "true");
        localStorage.setItem(USER_KEY, validatedUser);
        setIsAuthenticated(true);
      } else {
        setError(true);
      }
      setLoading(false);
    }, 80);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#f8fafc] text-slate-800 overflow-hidden font-sans px-4 sm:px-6">
      {/* Background Pastel Fluid Glows */}
      <div className="absolute top-[-25%] left-[-15%] w-[65%] h-[65%] bg-violet-200/40 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-25%] right-[-15%] w-[65%] h-[65%] bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[35%] left-[25%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10 transition-all duration-300">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 mb-3.5 border border-white">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            BOM Manager
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xs px-2">
            Secure, high-speed bill of materials and inventory log manager.
          </p>
        </div>

        {/* Crisp White Glass Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden transition-all duration-300">
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500"></div>

          {!selectedUser ? (
            /* Profile Selection Step */
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center mb-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">Select Profile</h2>
                <p className="text-[11px] sm:text-xs text-slate-400">Choose your account to login</p>
              </div>

              <div className="space-y-2.5">
                {USER_PROFILES.map((profile) => (
                  <button
                    key={profile.username}
                    onClick={() => {
                      setSelectedUser(profile);
                      setError(false);
                      setPassword("");
                    }}
                    className={`w-full flex items-center justify-between p-3.5 bg-white border ${profile.borderColor} ${profile.bgHover} rounded-2xl transition-all duration-200 group text-left shadow-sm hover:shadow-md hover:scale-[1.005]`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center font-bold text-xs tracking-wider text-white shadow-sm`}>
                        {profile.initials}
                      </div>
                      
                      {/* User Info */}
                      <div>
                        <h3 className="font-semibold text-slate-700 capitalize group-hover:text-slate-900 transition-colors text-sm sm:text-base">
                          {formatUserName(profile.username)}
                        </h3>
                      </div>
                    </div>

                    {/* Arrow icon */}
                    <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-800 transition-all">
                      <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Password Input Step */
            <div className="space-y-5 animate-slideIn">
              {/* Back Button */}
              <button
                onClick={() => setSelectedUser(null)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium"
              >
                <ChevronLeft size={15} />
                Back to profiles
              </button>

              <div className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedUser.gradient} flex items-center justify-center font-bold text-base tracking-wider text-white shadow-md mb-2.5`}>
                  {selectedUser.initials}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 capitalize">
                  {formatUserName(selectedUser.username)}
                </h2>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(false);
                      }}
                      className={`w-full px-4 py-3 bg-white border ${
                        error ? "border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:ring-violet-500/10 focus:border-violet-500"
                      } rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all pr-12 text-sm`}
                      disabled={loading}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {error && (
                    <p className="text-rose-600 text-xs mt-1 animate-pulse">
                      Incorrect password.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password}
                  className={`w-full py-3 bg-gradient-to-r ${selectedUser.gradient} text-white font-semibold rounded-2xl shadow-md hover:brightness-105 active:scale-[0.995] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none text-xs sm:text-sm`}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Verify and Login
                      <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] sm:text-xs text-slate-400 space-y-1">
          <p>© {new Date().getFullYear()} BOM Manager. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
