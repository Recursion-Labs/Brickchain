import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import  "@/styles/globals.css"

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
        {/* Remove common extension-injected attributes (e.g. Grammarly) before React hydration
            This prevents hydration mismatch caused by browser extensions that modify the DOM
            before React compares server HTML to client HTML. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const b = document && document.body;
                if (b && b.removeAttribute) {
                  b.removeAttribute('data-new-gr-c-s-check-loaded');
                  b.removeAttribute('data-gr-ext-installed');
                }
              } catch (e) { /* ignore */ }
            })();`,
          }}
        />

        {children}
      </body>
    </html>
  );
}
