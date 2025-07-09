import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SessionProvider from "./SessionProvider";
import Header from "./components/common/Header";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import Top10MissingSkillsTicker from "./components/common/Top10MissingSkillsTicker";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hone Your Craft",
  description:
    "Track and manage your job applications with ease.  Get insights into necessary skills with powerful analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en">
        <GoogleTagManager
          gtmId={`${process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID ?? ""}`}
        />
        <body className={inter.className}>
          <SessionProvider>
            <Header />
            <main className="bg-black">{children}</main>
            <ToastContainer />
          </SessionProvider>
          {/* <Top10MissingSkillsTicker /> */}
          <SpeedInsights />
        </body>
      </html>
    </AuthProvider>
  );
}
