import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SessionProvider from "./SessionProvider";
import Header from "./components/common/Header";
import "./globals.css";

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
    <html lang="en">
      <GoogleTagManager
        gtmId={`${process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID ?? ""}`}
      />
      <body className={inter.className}>
        <SessionProvider>
          <Header />
          <main className="bg-zinc-800">{children}</main>
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  );
}
