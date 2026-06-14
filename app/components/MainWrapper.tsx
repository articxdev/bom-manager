"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <main
      key={pathname}
      className="flex-1 overflow-auto bg-[#f8fafc] pt-14 pb-[72px] md:pt-0 md:pb-0 md:ml-64 animate-pageTransition"
    >
      {children}
    </main>
  );
}
