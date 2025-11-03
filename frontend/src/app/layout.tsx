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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider />
        {/* Remove common extension-injected attributes (e.g. Grammarly) before React hydration
            This prevents hydration mismatch caused by browser extensions that modify the DOM
            before React compares server HTML to client HTML. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                // Remove attributes commonly injected by browser extensions on <html> and <body>
                const html = document && document.documentElement;
                const body = document && document.body;
                const remove = (el: any, attr: string) => {
                  try { el && el.removeAttribute && el.removeAttribute(attr); } catch (e) { /* ignore */ }
                };

                // Known problematic attributes seen in hydration mismatch errors
                const attrs = [
                  'data-new-gr-c-s-check-loaded',
                  'data-gr-ext-installed',
                  'suppresshydrationwarning',
                  'data-qb-installed',
                  'cz-shortcut-listen'
                ];

                attrs.forEach(a => { remove(html, a); remove(body, a); });
              } catch (e) { /* ignore */ }
            })();`,
          }}
        />

        {children}
      </body>
    </html>
  );
}
