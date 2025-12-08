"use client";

import { useEffect, useState } from "react";
import PropertyCard from "@/components/property-card";
import { apiClient } from "@/lib/api";

export default function PropertiesSection() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProperties(true);
        const res = await apiClient.getProperties();
        if (res.success && res.data) {
          const apiData = res.data as { success?: boolean; data?: unknown[] };
          const raw = Array.isArray(res.data) ? res.data : Array.isArray(apiData.data) ? apiData.data : [];
          const normalized = (raw as any[]).map((p) => ({
            id: p.id,
            name: p.name || p.title || 'Untitled',
            location: p.location || p.Location || '',
            value: p.value || p.Value || 0,
            shares: p.shares || p.Shares || 0,
            image: p.image || '/api/placeholder/400/200',
          }));
          setProperties(normalized);
        }
      } catch (err) {
        console.error('Failed to load properties:', err);
      } finally {
        setLoadingProperties(false);
      }
    };

    load();
  }, []);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Properties</h2>
        <p className="text-sm text-muted-foreground">Tokenized and listed properties on BrickChain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loadingProperties ? (
          <p className="text-muted-foreground">Loading properties...</p>
        ) : properties.length === 0 ? (
          <p className="text-muted-foreground">No properties available yet.</p>
        ) : (
          <>
            {properties.map((prop) => (
              <div key={prop.id} className="p-1">
                <PropertyCard id={prop.id} name={prop.name} location={prop.location} value={prop.value} shares={prop.shares} image={prop.image} />
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
