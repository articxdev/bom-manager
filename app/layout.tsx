import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/Sidebar";
import { AuthWrapper } from "./components/AuthWrapper";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-[#f8fafc]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <AuthWrapper>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-auto md:ml-64 bg-[#f8fafc]">{children}</main>
          </div>
        </AuthWrapper>
      </body>
    </html>
  );
}
