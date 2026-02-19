import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KPI Dashboard Demo",
  description: "Sample-data KPI dashboard demo for The Real Estate Reset",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
