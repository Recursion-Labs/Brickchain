"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Home, Coins } from "lucide-react";

interface PropertyCardProps {
  id: string;
  name: string;
  location?: string;
  value?: number;
  shares?: number;
  image?: string;
}

export default function PropertyCard({ id, name, location, value, shares, image }: PropertyCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all">
      <CardHeader className="p-0">
        <div className="relative h-40 bg-sidebar overflow-hidden">
          <Image
            src={image || '/api/placeholder/400/200'}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-md line-clamp-2">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{location}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">${value?.toLocaleString() || '—'}</p>
            <p className="text-xs text-muted-foreground">Shares: {shares ?? '—'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 gap-2">
          <Link href={`/properties/${id}`} className="flex-1">
            <Button variant="ghost" size="sm" className="w-full justify-center gap-2">
              <Building className="h-4 w-4" />
              View Details
            </Button>
          </Link>
          <Button variant="default" size="sm" className="gap-2">
            <Coins className="h-4 w-4" />
            Buy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
