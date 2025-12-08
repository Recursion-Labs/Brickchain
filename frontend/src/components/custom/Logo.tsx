"use client"

import Image from "next/image";
import { useTheme } from "next-themes";
import React from "react";

interface LogoProps {
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ alt = "BrickChain", className = "", width = 40, height = 40 }: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const current = theme === "system" ? resolvedTheme : theme;

  // Default image mapping
  const darkLogo = "/logo-white.png"; // use white for dark background
  const lightLogo = "/logo-dark.png";
  const svgLogo = "/logo.svg";

  // Choose logo depending on theme preference
  const src = current === "dark" ? darkLogo : lightLogo;

  // Always fallback to svg if PNG missing
  // Note: next/image handles missing files at runtime; we still prefer png for raster assets
  return (
    <Image
      src={src || svgLogo}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
