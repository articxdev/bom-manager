"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Package,
  Box,
  Zap,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  History,
  LogOut,
  ChevronLeft,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AUTH_KEY, USER_KEY, formatUserName } from "@/lib/auth";

const PRIMARY_LINKS = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/components", label: "Components", icon: Package },
  { href: "/products", label: "Products", icon: Box },
  { href: "/production", label: "Production", icon: Zap },
  { href: "/stock-in", label: "Stock In", icon: TrendingUp },
];

const MORE_LINKS = [
  { href: "/damage", label: "Damage", icon: AlertTriangle },
  { href: "/restock", label: "Restock", icon: RefreshCw },
  { href: "/history", label: "History", icon: History },
];

const ALL_LINKS = [...PRIMARY_LINKS, ...MORE_LINKS];

// Pages that have a "parent" and should show a back button
const BACK_ROUTES: Record<string, { label: string; back: string }> = {
  "/products/new": { label: "New Product", back: "/products" },
  "/components/new": { label: "New Component", back: "/components" },
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  useEffect(() => {
    setLoggedInUser(localStorage.getItem(USER_KEY));
  }, []);

  // Close "more" drawer when navigating
  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  const getProfile = (user: string | null) => {
    const u = user?.toLowerCase();
    if (u === "harigovind") return { initials: "HG", gradient: "from-violet-500 to-purple-600" };
    if (u === "rahul") return { initials: "RA", gradient: "from-blue-500 to-indigo-600" };
    if (u === "shilna") return { initials: "SH", gradient: "from-emerald-500 to-teal-600" };
    return { initials: "U", gradient: "from-gray-500 to-slate-600" };
  };

  const profile = getProfile(loggedInUser);

  // Determine if current page is a dynamic product/component detail page
  const isDynamicDetail =
    /^\/products\/[^/]+$/.test(pathname) ||
    /^\/components\/[^/]+$/.test(pathname);

  const backRoute = BACK_ROUTES[pathname];
  const hasBackButton = !!(backRoute || isDynamicDetail);

  const getBackInfo = () => {
    if (backRoute) return { label: backRoute.label, back: backRoute.back };
    if (/^\/products\/[^/]+$/.test(pathname)) return { label: "Product Detail", back: "/products" };
    if (/^\/components\/[^/]+$/.test(pathname)) return { label: "Component Detail", back: "/components" };
    return null;
  };

  const backInfo = getBackInfo();

  // Active tab for bottom bar
  const activeLink = PRIMARY_LINKS.find((l) => l.href === pathname);
  const isMoreActive = MORE_LINKS.some((l) => l.href === pathname);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.reload();
  };

  return (
    <>
      {/* ─── DESKTOP SIDEBAR (md+) ─── */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex-col p-5 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/25">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">BOM Manager</span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
          {ALL_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-violet-50 text-violet-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} className={isActive ? "text-violet-600" : "text-gray-400"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Footer */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          {loggedInUser && (
            <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center font-bold text-xs text-white shadow-sm flex-shrink-0`}
                >
                  {profile.initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 capitalize truncate">
                    {formatUserName(loggedInUser)}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium">Logged In</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/30 transition-all cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>
          )}
          <div className="text-[10px] text-gray-400 px-2 flex justify-between items-center">
            <span>BOM Manager v1.0</span>
            <span>By harigovind</span>
          </div>
        </div>
      </aside>

      {/* ─── MOBILE TOP HEADER ─── */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center px-4 z-30 md:hidden">
        {hasBackButton && backInfo ? (
          /* Sub-page: show back button + page title */
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => router.push(backInfo.back)}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-gray-900 ml-1">{backInfo.label}</span>
            <div className="ml-auto flex items-center gap-2">
              {loggedInUser && (
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center font-bold text-[10px] text-white shadow-sm`}
                >
                  {profile.initials}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Main page: show logo + user avatar */
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/20">
                <Box className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 tracking-tight">BOM Manager</span>
            </div>
            {loggedInUser && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-rose-50 hover:border-rose-200 text-gray-500 hover:text-rose-600 transition-all active:scale-95"
                aria-label="Logout"
              >
                <div
                  className={`w-5 h-5 rounded-md bg-gradient-to-br ${profile.gradient} flex items-center justify-center font-bold text-[8px] text-white`}
                >
                  {profile.initials}
                </div>
                <LogOut size={13} />
              </button>
            )}
          </div>
        )}
      </header>

      {/* ─── MOBILE BOTTOM TAB BAR ─── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-stretch z-30 md:hidden safe-area-inset-bottom">
        {PRIMARY_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all active:scale-90 ${
                isActive ? "text-violet-600" : "text-gray-400"
              }`}
              aria-label={label}
            >
              <div className={`relative flex items-center justify-center w-8 h-6 rounded-full transition-all ${
                isActive ? "bg-violet-100" : ""
              }`}>
                <Icon size={isActive ? 20 : 19} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[9px] font-semibold leading-none tracking-tight ${
                isActive ? "text-violet-600" : "text-gray-400"
              }`}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* "More" button for secondary nav */}
        <button
          onClick={() => setShowMore(!showMore)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-all active:scale-90 ${
            isMoreActive || showMore ? "text-violet-600" : "text-gray-400"
          }`}
          aria-label="More navigation"
        >
          <div className={`relative flex items-center justify-center w-8 h-6 rounded-full transition-all ${
            isMoreActive || showMore ? "bg-violet-100" : ""
          }`}>
            <MoreHorizontal size={isMoreActive || showMore ? 20 : 19} strokeWidth={isMoreActive || showMore ? 2.5 : 2} />
          </div>
          <span className={`text-[9px] font-semibold leading-none tracking-tight ${
            isMoreActive || showMore ? "text-violet-600" : "text-gray-400"
          }`}>
            More
          </span>
        </button>
      </nav>

      {/* ─── MOBILE "MORE" DRAWER ─── */}
      {showMore && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setShowMore(false)}
          />
          {/* Drawer panel */}
          <div className="fixed bottom-[60px] left-4 right-4 bg-white rounded-3xl shadow-2xl shadow-gray-900/15 border border-gray-100 z-50 md:hidden overflow-hidden animate-slideUp">
            <div className="p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">
                More Options
              </p>
              <div className="space-y-1">
                {MORE_LINKS.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setShowMore(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-violet-50 text-violet-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isActive ? "bg-violet-100" : "bg-gray-100"
                      }`}>
                        <Icon size={16} className={isActive ? "text-violet-600" : "text-gray-500"} />
                      </div>
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
