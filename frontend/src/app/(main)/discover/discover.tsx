"use client";

import { useState } from 'react';
import FeaturedBanner from '@/components/discover/featured-banner';
import TrendingTokens from '@/components/discover/trending-tokens';
import RightCollections from '@/components/discover/right-collections';
import PropertiesSection from '@/components/discover/properties-section';
import { Palette } from 'lucide-react';

const CATEGORY_FILTERS = [
	{ id: 'all', label: 'All' },
	{ id: 'properties', label: 'Properties' },
	{ id: 'tokens', label: 'Tokens' },
];

export function DiscoverContent() {
	const [activeCategory, setActiveCategory] = useState('all');

	return (
		<div className="flex-1 min-h-screen">
			<div className="border-b border-border bg-background/95 backdrop-blur-md px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
						{CATEGORY_FILTERS.map((c) => (
							<button
								key={c.id}
								onClick={() => setActiveCategory(c.id)}
								className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
									activeCategory === c.id
										? 'bg-accent text-accent-foreground shadow-lg'
										: 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
								}`}
							>
								{c.label}
							</button>
						))}
					</div>
					<div className="flex items-center gap-2 ml-4">
						<button className="p-2 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors">
							<Palette className="w-4 h-4 text-muted-foreground" />
						</button>
					</div>
				</div>
			</div>

			<div className="p-6">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					<div className="lg:col-span-3 space-y-6">
						<FeaturedBanner />
						<TrendingTokens />
						<PropertiesSection />
					</div>

					<div className="lg:col-span-1 space-y-4">
						<RightCollections />
					</div>
				</div>
			</div>
		</div>
	);
}
