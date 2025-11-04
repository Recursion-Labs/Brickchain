"use client";

import NFTGallery from "./nft-gallery";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <NFTGallery activeTab="galleries" />
      </div>
    </div>
  );
}