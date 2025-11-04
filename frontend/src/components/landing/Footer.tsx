"use client";
import Link from "next/link";

import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

function Footer() {
  return (
    <footer className="w-full pt-12 pb-0 px-4 md:px-6 bg-background flex flex-col overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <Link href="/" className="flex items-center gap-2">
              <Icons.logo className="icon-class w-8" />
              <h2 className="text-lg font-bold text-foreground">Recursion Labs</h2>
            </Link>

            <h1 className="text-foreground/80 mt-4">
              Build by{" "}
              <span className="text-blue-500 hover:underline">
                <Link href="https://x.com/recursionlab">@recursionlab</Link>
              </span>
            </h1>
            <div className="mt-2">
              <Link href="https://x.com/compose/tweet?text=I%27ve%20been%20using%20%23Brickchain%20 share%20yourtought%20%40recursionlab%20">
                <Button variant="secondary">
                  Share Your Thoughts On
                  <Icons.twitter className="icon-class ml-1 w-3.5 " />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-foreground/50 mt-5">
              © {new Date().getFullYear()} Recursion Labs. All rights reserved.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Pages</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/docs"
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Docs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Components
                  </Link>
                </li>
                <li>
                  <Link
                    href="/examples"
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Examples
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Socials</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="https://github.com/recursion-Labs/"
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Github
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.linkedin.com"
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    LinkedIn
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://x.com/recursionlab"
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    X
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tos"
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="w-full flex items-center justify-center overflow-hidden px-2">
          <h1 className="text-center text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] xl:text-[10rem] 2xl:text-[10rem] font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground/40 to-foreground/10 select-none leading-tight max-w-full whitespace-normal lg:whitespace-nowrap">
            Recursion Labs
          </h1>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
