import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const orbitron = Orbitron({ variable: "--font-orbitron", weight: ["700", "900"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Teenoq — Maxwell Magaji",
  description: "Frontend Developer & Blockchain Engineer. Building from Lagos to the world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable}`}>
      <body>{children}</body>
    </html>
  );
}
