"use client";

import Image from 'next/image';

const NFT_COLLECTIONS = [
  { id: '1', name: 'Hypurr', image: '/api/placeholder/50/50', floor: '875.00', currency: 'HYPE', change: '-10.3%', verified: true },
  { id: '2', name: 'Pudgy Penguins', image: '/api/placeholder/50/50', floor: '5.70', currency: 'ETH', change: '-7.7%', verified: true },
];

export default function RightCollections() {
  return (
    <div>
      <div className="bg-card border border-border rounded-lg h-full min-h-96 overflow-y-auto space-y-2 p-3">
        {NFT_COLLECTIONS.map((collection) => (
          <div key={collection.id} className="bg-card border border-border rounded-lg p-3 hover:border-accent/50 transition-all hover:bg-card/80 cursor-pointer group">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-sidebar">
                  <Image src={collection.image} alt={collection.name} fill className="object-cover" sizes="48px" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <p className="font-semibold text-foreground text-sm truncate">{collection.name}</p>
                    {collection.verified && <span className="text-accent text-xs">✓</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{collection.floor} {collection.currency}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-xs font-semibold ${collection.change.startsWith('+') ? 'text-success' : 'text-error'}`}> {collection.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
