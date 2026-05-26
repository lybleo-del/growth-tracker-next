import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../lib/storage";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "成长助手",
  description: "个人成长陪伴工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className={`${inter.className} min-h-full`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
