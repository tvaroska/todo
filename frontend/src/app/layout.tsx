import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import GoogleOAuthProviderWrapper from "./components/GoogleOAuthProviderWrapper";
import Navbar from "./components/Navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Todo Application",
  description: "Attempt to build task management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <GoogleOAuthProviderWrapper>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </GoogleOAuthProviderWrapper>
      </body>
    </html>
  );
}
