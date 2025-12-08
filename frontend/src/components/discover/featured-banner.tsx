"use client";

import Image from "next/image";

interface Props {
  title?: string;
  subtitle?: string;
  image?: string;
}

export default function FeaturedBanner({ title = "VeeFriends", subtitle = "By VeeFriendsDev", image }: Props) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-colors group">
      <div className="relative h-32 overflow-hidden bg-sidebar">
        <Image src={image || "/api/placeholder/1200/400"} alt={title} fill className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-r from-background/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">{title}</h2>
            </div>
            <p className="text-xs text-foreground/60">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
