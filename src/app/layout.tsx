import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter", 
});

export const metadata: Metadata = {
  title: "Mission Control | The Real Estate Reset",
  description: "AI Agent Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased text-[#F0F0F0] bg-[#0F1117]`}>
        <ConvexClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
