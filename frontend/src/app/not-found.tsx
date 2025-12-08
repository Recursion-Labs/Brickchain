"use client"

import Link from "next/link"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import Lottie from "lottie-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const [animationData, setAnimationData] = useState<any | null>(null)

  useEffect(() => {
    let mounted = true
    // Load the local lottie JSON from public folder — fallback to SVG if fetch fails
    fetch('/mean_lottie.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load lottie')
        return res.json()
      })
      .then((json) => {
        if (mounted) setAnimationData(json)
      })
      .catch(() => {
        if (mounted) setAnimationData(null)
      })

    return () => { mounted = false }
  }, [])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="mx-auto">
          {/* Try to render the local Lottie animation first; fallback to the optimized svg */}
          <div className="mx-auto w-[360px] h-[360px] sm:w-[460px] sm:h-[460px]">
            {animationData ? (
              <div className="w-full h-full flex items-center justify-center" role="img" aria-label="404 animation">
                <Lottie animationData={animationData} loop={true} style={{ width: '100%', height: '100%' }} />
              </div>
            ) : (
              <Image
                src="/animations/404.svg"
                alt="404 illustration — page not found"
                width={460}
                height={460}
                className="w-full h-full object-contain"
                priority={false}
              />
            )}
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mt-6">404 — Page not found</h1>
        <p className="text-muted-foreground mt-2">Sorry, we couldn’t find the page you’re looking for.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/">
            <Button>Return home</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
