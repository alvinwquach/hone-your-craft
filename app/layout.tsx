import type { Metadata } from "next";
import { Inter } from "next/font/google";
import SessionProvider from "./SessionProvider";
import "./globals.css";
import Header from "./components/common/Header";

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
      <body className={inter.className}>
        <SessionProvider>
          <Header />
          <main className="">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
