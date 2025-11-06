import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import  "@/styles/globals.css"
import { ToastProvider } from "@/components/providers/toast-provider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrickChain - Property Trading as Simple as Sending Crypto",
  description: "Transforming real estate with privacy-first blockchain technology. Tokenize properties into fractional, tradable digital tokens with zero-knowledge proofs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ToastProvider />
          {children}
        </body>
      </html>
  );
}
