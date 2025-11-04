'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import {
	Palette,
	Gamepad2,
	Paintbrush,
	User,
	Trophy,
	Cog,
} from 'lucide-react';

// Category filter data with icons
const CATEGORY_FILTERS = [
	{ id: 'all', label: 'All', Icon: Palette },
	{ id: 'gaming', label: 'Gaming', Icon: Gamepad2 },
	{ id: 'art', label: 'Art', Icon: Paintbrush },
	{ id: 'pfp', label: 'PFPs', Icon: User },
	{ id: 'collectibles', label: 'Collectibles', Icon: Trophy },
	{ id: 'utility', label: 'Utility', Icon: Cog },
];

// Featured Collection Banner
const FEATURED_COLLECTION_BANNER = {
	id: '1',
	name: 'VeeFriends',
	creator: 'By VeeFriendsDev',
	image: 'https://images.unsplash.com/photo-1578926302477-cd70b6ad5b3d?w=1200&h=400&fit=crop',
	verified: true,
	floorPrice: '1.299',
	currency: 'ETH',
	items: '10,255',
	totalVolume: '71K',
	volumeCurrency: 'ETH',
	listed: '1.2%',
	nftImages: [
		'https://images.unsplash.com/photo-1578462996442-48f60103fc96?w=100&h=100&fit=crop',
		'https://images.unsplash.com/photo-1578926314433-b63d9b737814?w=100&h=100&fit=crop',
		'https://images.unsplash.com/photo-1578926302477-cd70b6ad5b3d?w=100&h=100&fit=crop',
	],
};

// NFT Collections - Top collections list
const NFT_COLLECTIONS = [
	{
		id: '1',
		name: 'Hypurr',
		image: 'https://images.unsplash.com/photo-1634821302718-0bea8d1c2b11?w=50&h=50&fit=crop',
		floor: '875.00',
		currency: 'HYPE',
		change: '-10.3%',
		verified: true,
	},
	{
		id: '2',
		name: 'Pudgy Penguins',
		image: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=50&h=50&fit=crop',
		floor: '5.70',
		currency: 'ETH',
		change: '-7.7%',
		verified: true,
	},
	{
		id: '3',
		name: 'DX Terminal',
		image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=50&h=50&fit=crop',
		floor: '< 0.01',
		currency: 'ETH',
		change: '-0.7%',
		verified: true,
	},
	{
		id: '4',
		name: 'Moonbirds',
		image: 'https://images.unsplash.com/photo-1611428425397-b10214e90cf8?w=50&h=50&fit=crop',
		floor: '1.82',
		currency: 'ETH',
		change: '+4%',
		verified: true,
	},
	{
		id: '5',
		name: 'CryptoPunks',
		image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=50&h=50&fit=crop',
		floor: '36.47',
		currency: 'ETH',
		change: '-1.4%',
		verified: true,
	},
	{
		id: '6',
		name: 'Bored Ape Yacht Club',
		image: 'https://images.unsplash.com/photo-1624995997946-a1c2e315a42f?w=50&h=50&fit=crop',
		floor: '6.20',
		currency: 'ETH',
		change: '-0.5%',
		verified: true,
	},
	{
		id: '7',
		name: 'Lil Pudgys',
		image: 'https://images.unsplash.com/photo-1622737133971-fea5ad247ebc?w=50&h=50&fit=crop',
		floor: '0.73',
		currency: 'ETH',
		change: '-3.9%',
		verified: true,
	},
	{
		id: '8',
		name: 'Milady Maker',
		image: 'https://images.unsplash.com/photo-1627873649365-b2f9b6e3cb8f?w=50&h=50&fit=crop',
		floor: '1.13',
		currency: 'ETH',
		change: '-9.2%',
		verified: true,
	},
	{
		id: '9',
		name: 'FARWORLD // Creatures',
		image: 'https://images.unsplash.com/photo-1629543086877-faa24d7ca5cb?w=50&h=50&fit=crop',
		floor: '< 0.01',
		currency: 'ETH',
		change: '-1.8%',
		verified: true,
	},
	{
		id: '10',
		name: 'Azuki',
		image: 'https://images.unsplash.com/photo-1632632889765-97efc23e7c19?w=50&h=50&fit=crop',
		floor: '0.98',
		currency: 'ETH',
		change: '-6.6%',
		verified: true,
	},
	{
		id: '11',
		name: 'VeeFriends',
		image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=50&h=50&fit=crop',
		floor: '1.30',
		currency: 'ETH',
		change: '-2.7%',
		verified: true,
	},
];

// Trending Tokens
const TRENDING_TOKENS = [
	{
		id: '1',
		name: 'DOGE',
		symbol: 'DOGE-1',
		price: '$0.001',
		change: '+266%',
		icon: '🐕',
		trend: [10, 15, 20, 25, 30, 40, 50],
	},
	{
		id: '2',
		name: 'Unite',
		symbol: 'UNITE',
		price: '< $0.001',
		change: '+77.5%',
		icon: '🎮',
		trend: [5, 10, 15, 25, 35, 50, 60],
	},
	{
		id: '3',
		name: 'Zerebro',
		symbol: 'ZEREBRO',
		price: '$0.056',
		change: '+37.3%',
		icon: '🧠',
		trend: [8, 12, 18, 22, 28, 35, 40],
	},
	{
		id: '4',
		name: 'Umbra',
		symbol: 'UMBRA',
		price: '$0.652',
		change: '+26.3%',
		icon: '🌊',
		trend: [5, 8, 12, 16, 20, 25, 28],
	},
	{
		id: '5',
		name: 'jelly-market',
		symbol: 'JELLY',
		price: '$0.201',
		change: '+203.5%',
		icon: '🪼',
		trend: [10, 20, 30, 50, 70, 90, 100],
	},
	{
		id: '6',
		name: 'AI Rig Co',
		symbol: 'ARC',
		price: '$0.028',
		change: '+40.8%',
		icon: '🤖',
		trend: [5, 10, 15, 20, 25, 30, 35],
	},
	{
		id: '7',
		name: 'Horizen',
		symbol: 'ZEN',
		price: '$21.318',
		change: '+31.3%',
		icon: '⚡',
		trend: [15, 18, 22, 26, 29, 32, 35],
	},
	{
		id: '8',
		name: 'Gorbaga',
		symbol: 'GOR',
		price: '$0.007',
		change: '+25.8%',
		icon: '👹',
		trend: [5, 8, 12, 16, 20, 23, 26],
	},
];

// Featured Collections
const FEATURED_COLLECTIONS = [
	{
		id: '1',
		name: 'Bodies Of Color',
		image: 'https://images.unsplash.com/photo-1578462996442-48f60103fc96?w=300&h=300&fit=crop',
		floorPrice: '0.35',
		currency: 'ETH',
		change: '0%',
		verified: true,
		category: 'Art',
	},
	{
		id: '2',
		name: 'Ofrenda by Stefano Contiero',
		image: 'https://images.unsplash.com/photo-1578926302477-cd70b6ad5b3d?w=300&h=300&fit=crop',
		floorPrice: '0.0031',
		currency: 'ETH',
		change: '-22.5%',
		verified: true,
		category: 'Generative',
	},
	{
		id: '3',
		name: 'The Warplets',
		image: 'https://images.unsplash.com/photo-1578926314433-b63d9b737814?w=300&h=300&fit=crop',
		floorPrice: '0.0037',
		currency: 'ETH',
		change: '-1.2%',
		verified: true,
		category: 'Gaming',
	},
	{
		id: '4',
		name: 'Cambria Islands',
		image: 'https://images.unsplash.com/photo-1578462996442-48f60103fc96?w=300&h=300&fit=crop',
		floorPrice: '0.133',
		currency: 'ETH',
		change: '-3.6%',
		verified: true,
		category: 'Metaverse',
	},
];

export function DiscoverContent() {
	const [activeCategory, setActiveCategory] = useState('all');
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	const goToNextImage = () => {
		setCurrentImageIndex((prev) => (prev + 1) % FEATURED_COLLECTION_BANNER.nftImages.length);
	};

	const goToPrevImage = () => {
		setCurrentImageIndex((prev) =>
			prev === 0 ? FEATURED_COLLECTION_BANNER.nftImages.length - 1 : prev - 1
		);
	};

	return (
		<div className="flex-1 min-h-screen">
			{/* Top Navigation Bar - NOT STICKY */}
		<div className="border-b border-border bg-background/95 backdrop-blur-md px-6 py-4">
			<div className="flex items-center justify-between">
				{/* Category Filters with Icons */}
				<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
					{CATEGORY_FILTERS.map((category) => {
						const Icon = category.Icon;
						return (
							<button
								key={category.id}
								onClick={() => setActiveCategory(category.id)}
								className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
									activeCategory === category.id
										? 'bg-accent text-accent-foreground shadow-lg'
										: 'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50'
								}`}
							>
									<Icon className="w-4 h-4" />
									{category.label}
								</button>
							);
						})}
					</div>

				{/* Display Toggle */}
				<div className="flex items-center gap-2 ml-4">
					<button className="p-2 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors">
						<Palette className="w-4 h-4 text-muted-foreground" />
					</button>
				</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="p-6">
				{/* Main Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Left Section - Featured Banner, Trending & Featured Collections (3 columns) */}
					<div className="lg:col-span-3 space-y-6">
					{/* Featured Collection Banner */}
					<div className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-colors group">
						{/* Banner Image */}
						<div className="relative h-32 overflow-hidden bg-sidebar">
							<Image
								src={FEATURED_COLLECTION_BANNER.image}
								alt={FEATURED_COLLECTION_BANNER.name}
								fill
								className="object-cover group-hover:scale-105 transition-transform duration-300"
							/>
							<div className="absolute inset-0 bg-linear-to-r from-background/60 to-transparent" />

							{/* Banner Info */}
							<div className="absolute inset-0 flex flex-col justify-between p-4">
								<div>
									<div className="flex items-center gap-2 mb-1">
										<h2 className="text-xl font-bold text-foreground">{FEATURED_COLLECTION_BANNER.name}</h2>
										{FEATURED_COLLECTION_BANNER.verified && (
											<span className="text-accent text-sm">✓</span>
										)}
									</div>
									<p className="text-xs text-foreground/60">{FEATURED_COLLECTION_BANNER.creator}</p>
								</div>

								{/* Stats - Compact */}
								<div className="grid grid-cols-2 gap-3 text-foreground text-xs">
									<div>
										<p className="text-foreground/60 text-xs mb-0.5">FLOOR</p>
										<p className="font-bold text-sm">{FEATURED_COLLECTION_BANNER.floorPrice}</p>
									</div>
									<div>
										<p className="text-foreground/60 text-xs mb-0.5">VOLUME</p>
										<p className="font-bold text-sm">{FEATURED_COLLECTION_BANNER.totalVolume}</p>
									</div>
								</div>
							</div>
						</div>

						{/* NFT Preview Carousel - Compact */}
						<div className="bg-card/50 border-t border-border px-3 py-2 flex items-center justify-between">
							<button
								onClick={goToPrevImage}
								className="p-1 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors"
							>
								<svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
							</button>

							<div className="flex items-center gap-2">
								{FEATURED_COLLECTION_BANNER.nftImages.map((image, index) => (
									<div
										key={index}
										onClick={() => setCurrentImageIndex(index)}
										className={`relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
											index === currentImageIndex
												? 'border-accent scale-110'
												: 'border-border hover:border-accent/50'
										}`}
									>
										<Image
											src={image}
											alt={`Preview ${index}`}
											fill
											className="object-cover"
										/>
									</div>
								))}
							</div>

							<button
								onClick={goToNextImage}
								className="p-1 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent/50 transition-colors"
							>
								<svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>
					</div>						{/* Trending Tokens Section */}
						<section className="space-y-4">
							<div>
								<h2 className="text-2xl font-bold text-foreground mb-1">Trending Tokens</h2>
								<p className="text-sm text-muted-foreground">Largest price change in the past day</p>
							</div>

							<Carousel className="w-full">
								<CarouselContent className="-ml-2 md:-ml-4">
									{TRENDING_TOKENS.map((token) => (
										<CarouselItem
											key={token.id}
											className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3"
										>
											<div className="bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/10 h-full">
												{/* Token Header */}
												<div className="flex items-center gap-3 mb-4">
													<div className="w-10 h-10 rounded-full bg-sidebar flex items-center justify-center text-lg shrink-0">
														{token.icon}
													</div>
													<div className="min-w-0">
														<p className="font-semibold text-foreground text-sm">{token.name}</p>
														<p className="text-xs text-muted-foreground">{token.symbol}</p>
													</div>
												</div>

												{/* Price & Change */}
												<div className="space-y-2 mb-4">
													<p className="font-bold text-lg text-foreground">{token.price}</p>
													<p
														className={`text-sm font-semibold ${
															token.change.startsWith('+')
																? 'text-success'
																: 'text-error'
														}`}
													>
														{token.change}
													</p>
												</div>

												{/* Mini Trend Chart */}
												<div className="h-12 bg-sidebar/50 rounded flex items-end gap-0.5 p-1">
													{token.trend.map((value, i) => (
														<div
															key={i}
															className="flex-1 bg-linear-to-t from-success to-success rounded-sm opacity-80"
															style={{
																height: `${(value / Math.max(...token.trend)) * 100}%`,
																minHeight: '2px',
															}}
														/>
													))}
												</div>
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselPrevious className="left-0" />
								<CarouselNext className="right-0" />
							</Carousel>
						</section>

						{/* Featured Collections Section */}
						<section className="space-y-4">
							<div>
								<h2 className="text-2xl font-bold text-foreground mb-1">Featured Collections</h2>
								<p className="text-sm text-muted-foreground">This week&apos;s curated collections</p>
							</div>

							<Carousel className="w-full">
								<CarouselContent className="-ml-2 md:-ml-4">
									{FEATURED_COLLECTIONS.map((collection) => (
										<CarouselItem
											key={collection.id}
											className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/2"
										>
											<div className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-all hover:shadow-lg hover:shadow-accent/10 h-full">
												{/* Image */}
												<div className="relative w-full h-40 overflow-hidden bg-sidebar">
													<Image
														src={collection.image}
														alt={collection.name}
														fill
														className="object-cover hover:scale-110 transition-transform duration-300"
													/>
												</div>

												{/* Info */}
												<div className="p-4">
													<p className="text-xs text-muted-foreground font-medium mb-2">{collection.category}</p>
													<h3 className="font-semibold text-foreground mb-3 line-clamp-2">{collection.name}</h3>

													<div className="flex justify-between items-center">
														<div>
															<p className="text-xs text-muted-foreground mb-1">Floor</p>
															<p className="font-bold text-foreground">
																{collection.floorPrice} {collection.currency}
															</p>
														</div>
														<div
															className={`text-sm font-semibold px-2 py-1 rounded ${
																collection.change.startsWith('+')
																	? 'text-success bg-success/10'
																	: 'text-error bg-error/10'
															}`}
														>
															{collection.change}
														</div>
													</div>
												</div>
											</div>
										</CarouselItem>
									))}
								</CarouselContent>
								<CarouselPrevious className="left-0" />
								<CarouselNext className="right-0" />
							</Carousel>
						</section>
					</div>

					{/* Right Section - Collections List (1 column) */}
					<div className="lg:col-span-1 space-y-4">
						<div>
							<h2 className="text-2xl font-bold text-foreground mb-1">NFTs & Tokens</h2>
							<p className="text-sm text-muted-foreground">Popular collections</p>
						</div>

						{/* Collections List - Large Scrollable */}
						<div className="bg-card border border-border rounded-lg h-full min-h-96 overflow-y-auto space-y-2 p-3">
							{NFT_COLLECTIONS.map((collection) => (
								<div
									key={collection.id}
									className="bg-card border border-border rounded-lg p-3 hover:border-accent/50 transition-all hover:bg-card/80 cursor-pointer group"
								>
									<div className="flex items-center justify-between gap-2">
										{/* Left - Collection Info */}
										<div className="flex items-center gap-2 flex-1 min-w-0">
											{/* Thumbnail */}
											<div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-sidebar">
												<Image
													src={collection.image}
													alt={collection.name}
													fill
													sizes="48px"
													className="object-cover group-hover:scale-110 transition-transform"
												/>
											</div>

											{/* Info */}
											<div className="min-w-0">
												<div className="flex items-center gap-1">
													<p className="font-semibold text-foreground text-sm truncate">{collection.name}</p>
													{collection.verified && <span className="text-accent text-xs">✓</span>}
												</div>
												<p className="text-xs text-muted-foreground">
													{collection.floor} {collection.currency}
												</p>
											</div>
										</div>

										{/* Right - Price Change */}
										<div className="text-right shrink-0">
											<p className={`text-xs font-semibold ${
												collection.change.startsWith('+')
													? 'text-success'
													: 'text-error'
											}`}>
												{collection.change}
											</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
