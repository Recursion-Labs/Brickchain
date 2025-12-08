"use client";

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  type?: string;
  location?: string;
  value?: number;
  shares?: number;
  owner?: string;
  status?: string;
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getProperty(id);
        if (res.success && res.data) setProperty(res.data as unknown as Property);
      } catch (err) {
        console.error('Failed to load property', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (!property)
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card>
          <CardContent>
            <p className="text-muted-foreground">Property not found</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/discover">Back to Discover</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
          <p className="text-sm text-muted-foreground">{property.type} • {property.location}</p>
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2"><strong>Value:</strong> ${property.value?.toLocaleString()}</p>
                <p className="mb-2"><strong>Shares:</strong> {property.shares}</p>
                <p className="mb-2"><strong>ID:</strong> {property.id}</p>
                <div className="mt-4 flex gap-2">
                  <Button>Tokenize</Button>
                  <Button variant="ghost">View Documents</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="w-72 hidden lg:block">
          <Card>
            <CardContent>
              <div className="mb-4">
                <p className="font-semibold">Owner</p>
                <p className="text-sm text-muted-foreground">{property.owner || '—'}</p>
              </div>
              <div className="mb-4">
                <p className="font-semibold">Status</p>
                <p className="text-sm text-muted-foreground">{property.status || 'Active'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
