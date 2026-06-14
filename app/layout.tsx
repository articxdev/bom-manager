import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";

export const metadata: Metadata = {
  title: "BOM Manager - Bill of Materials Management",
  description: "Manage components, products, and production with BOM tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="h-full bg-slate-50">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto md:ml-64">{children}</main>
        </div>
      </body>
    </html>
  );
}
