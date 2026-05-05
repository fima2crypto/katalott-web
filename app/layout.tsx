import type { Metadata } from "next";

import { inter } from "./ui/fonts";

import "./ui/globals.css";

export const metadata: Metadata = {
  title: "Katalot App",
  description: "Power of Vietlott",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}