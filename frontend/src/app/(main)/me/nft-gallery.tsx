"use client";

import { useState } from "react";
import { Heart, Eye, Share2, Grid3x3, List } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface NFT {
  id: string;
  title: string;
  image: string;
  price?: string;
  likes: number;
  views: number;
  isLiked: boolean;
}

interface NFTGalleryProps {
  activeTab?: "galleries" | "favorites" | "property" | "watchlist";
}

export default function NFTGallery({ activeTab = "galleries" }: NFTGalleryProps) {
  const [currentTab, setCurrentTab] = useState<"galleries" | "favorites" | "property" | "watchlist">(activeTab);

  // Mock data - replace with API calls
  const galleryNFTs: NFT[] = [
    { id: "1", title: "Digital Art #001", image: "/nft-1.jpg", price: "2.5 ETH", likes: 234, views: 1200, isLiked: false },
    { id: "2", title: "Pixel Adventure", image: "/nft-2.jpg", price: "1.8 ETH", likes: 156, views: 890, isLiked: false },
    { id: "3", title: "Cosmic Journey", image: "/nft-3.jpg", price: "3.2 ETH", likes: 342, views: 2100, isLiked: false },
    { id: "4", title: "Neon Dreams", image: "/nft-4.jpg", price: "1.5 ETH", likes: 98, views: 567, isLiked: false },
    { id: "5", title: "Favorite Art #001", image: "/nft-5.jpg", price: "4.2 ETH", likes: 456, views: 3200, isLiked: true },
    { id: "6", title: "Favorite Art #002", image: "/nft-6.jpg", price: "2.9 ETH", likes: 289, views: 1800, isLiked: true },
  ];

  const favoritesNFTs: NFT[] = [
    { id: "5", title: "Favorite Art #001", image: "/nft-5.jpg", price: "4.2 ETH", likes: 456, views: 3200, isLiked: true },
    { id: "6", title: "Favorite Art #002", image: "/nft-6.jpg", price: "2.9 ETH", likes: 289, views: 1800, isLiked: true },
  ];

  const propertyNFTs: NFT[] = [
    { id: "7", title: "My Property #001", image: "/nft-7.jpg", price: "5.5 ETH", likes: 567, views: 4200, isLiked: false },
    { id: "8", title: "My Property #002", image: "/nft-8.jpg", price: "3.8 ETH", likes: 234, views: 1900, isLiked: false },
    { id: "9", title: "My Property #003", image: "/nft-9.jpg", price: "2.1 ETH", likes: 145, views: 890, isLiked: false },
  ];

  const watchlistNFTs: NFT[] = [
    { id: "10", title: "Watching #001", image: "/nft-10.jpg", price: "2.1 ETH", likes: 145, views: 890, isLiked: false },
    { id: "11", title: "Watching #002", image: "/nft-11.jpg", price: "1.9 ETH", likes: 123, views: 756, isLiked: false },
    { id: "12", title: "Watching #003", image: "/nft-12.jpg", price: "3.5 ETH", likes: 267, views: 1456, isLiked: false },
  ];

  const getNFTsByTab = () => {
    switch (currentTab) {
      case "favorites":
        return favoritesNFTs;
      case "property":
        return propertyNFTs;
      case "watchlist":
        return watchlistNFTs;
      default:
        return galleryNFTs;
    }
  };

  const nfts = getNFTsByTab();

  return (
    <div className="w-full">
      {/* Banner Section */}
      <div className="relative h-64 bg-linear-to-r from-purple-600 via-purple-500 to-purple-600 rounded-lg overflow-hidden mb-0">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        <button className="absolute top-4 right-4 z-10 bg-foreground/80 hover:bg-foreground text-background p-2 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>

      {/* Profile Section */}
      <div className="relative -mt-20 mb-8 px-6">
        <div className="flex items-end justify-between">
          <div className="flex items-end gap-6">
            {/* Profile Photo */}
            <div className="relative z-20">
              <div className="w-40 h-40 rounded-2xl bg-secondary border-4 border-card overflow-hidden">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: "url(/profile-avatar.jpg)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                />
              </div>
              <button className="absolute bottom-3 right-3 bg-foreground text-background p-2 rounded-full hover:opacity-90 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            {/* Profile Info */}
            <div className="pb-4">
              <h1 className="text-4xl font-bold text-foreground mb-2">0xbe39d...a328</h1>
              <p className="text-muted-foreground">BE3900</p>
              <div className="flex gap-3 mt-4">
                <button className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors text-foreground">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11 5a3 3 0 116 0v1H5v12a2 2 0 002 2h10a2 2 0 002-2V6a1 1 0 100-2v1a3 3 0 00-3 3H8a3 3 0 00-3-3v-1a1 1 0 100 2h1V5z" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors text-foreground">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors text-foreground">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20h7.42m0 0a9.978 9.978 0 001.414-19.948" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden lg:grid grid-cols-4 gap-8 pb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">PORTFOLIO VALUE</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-bold text-foreground">0.00 ETH</p>
                <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.658 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">USD VALUE</p>
              <p className="text-2xl font-bold text-foreground mt-2">$0.00</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">NFTS</p>
              <p className="text-2xl font-bold text-foreground mt-2">0%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">TOKENS</p>
              <p className="text-2xl font-bold text-foreground mt-2">0%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 mb-6 border-b border-border">
        {[
          { id: "galleries", label: "Galleries" },
          { id: "nfts", label: "NFTs" },
          { id: "tokens", label: "Tokens" },
          { id: "listings", label: "Listings" },
          { id: "offers", label: "Offers" },
          { id: "property", label: "Property" },
          { id: "created", label: "Created" },
          { id: "watchlist", label: "Watchlist" },
          { id: "favorites", label: "Favorites" },
          { id: "activity", label: "Activity" },
        ].map((tab) => {
          const tabMap: Record<string, "galleries" | "favorites" | "property" | "watchlist"> = {
            galleries: "galleries",
            property: "property",
            watchlist: "watchlist",
            favorites: "favorites",
          };
          const isActive = tabMap[tab.id] && currentTab === tabMap[tab.id];

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tabMap[tab.id]) {
                  setCurrentTab(tabMap[tab.id]);
                }
              }}
              className={cn(
                "px-0 py-3 font-medium text-sm transition-all relative whitespace-nowrap",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Filters and View Options */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <div className="flex gap-2 mt-2">
              {["All", "Listed", "Not Listed", "Hidden"].map((status) => (
                <button
                  key={status}
                  className="px-3 py-1 rounded bg-secondary text-foreground text-sm hover:bg-accent transition-colors"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search for items"
              className="w-full px-4 py-2 rounded bg-input border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-ring"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 rounded bg-input border border-border text-foreground focus:outline-none focus:border-ring">
            <option>Recently received</option>
            <option>Oldest first</option>
            <option>Newest first</option>
          </select>
          <button className="p-2 rounded bg-input border border-border hover:bg-secondary transition-colors">
            <Grid3x3 className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2 rounded bg-input border border-border hover:bg-secondary transition-colors">
            <List className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* NFT Grid */}
      {nfts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No items yet</h3>
          <p className="text-muted-foreground">Start by exploring and adding items to your collection</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nfts.map((nft, index) => (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative rounded-lg overflow-hidden border border-border bg-card hover:border-foreground transition-all hover:shadow-lg"
            >
              {/* Image Container */}
              <div className="relative h-56 bg-secondary overflow-hidden">
                <div
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundImage: `url(${nft.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                {/* Overlay on hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center gap-3"
                >
                  <button className="bg-foreground text-background p-3 rounded-full hover:opacity-90 transition-opacity">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="bg-foreground text-background p-3 rounded-full hover:opacity-90 transition-opacity">
                    <Share2 className="w-5 h-5" />
                  </button>
                </motion.div>

                {/* Liked Badge */}
                {nfts.length > 0 && index % 5 === 0 && (
                  <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    ❤️ Liked
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-foreground font-semibold truncate mb-2">{nft.title}</h3>

                {nft.price && (
                  <p className="text-ring font-bold text-lg mb-3">{nft.price}</p>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{nft.likes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{nft.views}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
