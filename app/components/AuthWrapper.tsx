"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowRight, Eye, EyeOff, User, ChevronLeft } from "lucide-react";
import { AUTH_KEY, USER_KEY, validateLogin, formatUserName } from "@/lib/auth";

const USER_PROFILES = [
  {
    username: "harigovind",
    initials: "HG",
    role: "Administrator",
    gradient: "from-violet-500 to-purple-600",
    glow: "bg-violet-500/20",
    textColor: "text-violet-400",
    borderColor: "border-violet-500/30",
  },
  {
    username: "rahul",
    initials: "RA",
    role: "Inventory Manager",
    gradient: "from-blue-500 to-indigo-600",
    glow: "bg-blue-500/20",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
  },
  {
    username: "shilna",
    initials: "SH",
    role: "Production Lead",
    gradient: "from-emerald-500 to-teal-600",
    glow: "bg-emerald-500/20",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
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
      <div className="flex items-center justify-center min-h-screen bg-[#070b13]">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
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

    // Subtle premium network delay simulation
    setTimeout(() => {
      const validatedUser = validateLogin(password);
      // Ensure the validated user matches the selected profile
      if (validatedUser && selectedUser && validatedUser.toLowerCase() === selectedUser.username.toLowerCase()) {
        localStorage.setItem(AUTH_KEY, "true");
        localStorage.setItem(USER_KEY, validatedUser);
        setIsAuthenticated(true);
      } else {
        setError(true);
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#070b13] text-white overflow-hidden font-sans">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-violet-900/20 rounded-full blur-[150px] pointer-events-none animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-emerald-950/20 rounded-full blur-[150px] pointer-events-none animate-pulse duration-[8000ms]"></div>
      <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-blue-950/15 rounded-full blur-[130px] pointer-events-none"></div>

      <div className="w-full max-w-lg p-6 z-10 transition-all duration-300">
        
        {/* Main Logo Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/30 mb-3 border border-violet-500/20">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
            BOM Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 max-w-sm">
            Access secure bill of materials, components inventory, and production logs.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-500">
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500"></div>

          {!selectedUser ? (
            /* Profile Selection Step */
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-lg font-bold text-slate-100">Select Profile</h2>
                <p className="text-xs text-slate-500 mt-1">Choose your account to enter password</p>
              </div>

              <div className="space-y-3">
                {USER_PROFILES.map((profile) => (
                  <button
                    key={profile.username}
                    onClick={() => {
                      setSelectedUser(profile);
                      setError(false);
                      setPassword("");
                    }}
                    className={`w-full flex items-center justify-between p-4 bg-slate-950/40 hover:bg-slate-950/80 border ${profile.borderColor} rounded-2xl transition-all duration-200 group text-left hover:scale-[1.01]`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center font-bold text-sm tracking-wider text-white shadow-md`}>
                        {profile.initials}
                      </div>
                      
                      {/* User Info */}
                      <div>
                        <h3 className="font-semibold text-slate-200 capitalize group-hover:text-white transition-colors">
                          {formatUserName(profile.username)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {profile.role}
                        </p>
                      </div>
                    </div>

                    {/* Arrow sign */}
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-all">
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Password Input Step */
            <div className="space-y-6 animate-slideIn">
              {/* Back Button */}
              <button
                onClick={() => setSelectedUser(null)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
                Back to profiles
              </button>

              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedUser.gradient} flex items-center justify-center font-bold text-xl tracking-wider text-white shadow-lg mb-3`}>
                  {selectedUser.initials}
                </div>
                <h2 className="text-xl font-bold text-slate-100 capitalize">
                  {formatUserName(selectedUser.username)}
                </h2>
                <p className="text-xs text-slate-500 mt-1">{selectedUser.role}</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
                      className={`w-full px-4 py-3.5 bg-slate-950/70 border ${
                        error ? "border-rose-500 focus:ring-rose-500/20" : "border-slate-800 focus:ring-violet-500/20 focus:border-violet-500"
                      } rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-4 transition-all pr-12 text-sm`}
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
                    <p className="text-rose-400 text-xs mt-1 animate-pulse">
                      Incorrect password. Hint: password is your username.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password}
                  className={`w-full py-3.5 bg-gradient-to-r ${selectedUser.gradient} text-white font-semibold rounded-2xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none text-sm`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Verify and Login
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-600 space-y-1">
          <p>© {new Date().getFullYear()} BOM Manager. All rights reserved.</p>
          <p>
            Developed by <span className="text-slate-400 font-medium capitalize">harigovind</span>
          </p>
        </div>
      </div>
    </div>
  );
}
