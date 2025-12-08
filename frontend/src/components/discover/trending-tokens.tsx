"use client";

export default function TrendingTokens() {
  const tokens = [
    { id: '1', name: 'DOGE', symbol: 'DOGE-1', price: '$0.001', change: '+266%', icon: '🐕', trend: [10, 15, 20, 25, 30, 40, 50] },
    { id: '2', name: 'Unite', symbol: 'UNITE', price: '< $0.001', change: '+77.5%', icon: '🎮', trend: [5, 10, 15, 25, 35, 50, 60] },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Trending Tokens</h2>
        <p className="text-sm text-muted-foreground">Largest price change in the past day</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tokens.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sidebar flex items-center justify-center text-lg">{t.icon}</div>
              <div>
                <p className="font-semibold text-foreground text-sm">{t.name} <span className="text-xs text-muted-foreground">{t.symbol}</span></p>
                <p className="text-xs text-muted-foreground">{t.price} • {t.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
