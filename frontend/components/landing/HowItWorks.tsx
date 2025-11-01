import { Home, Coins, Shield, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Home,
      number: '01',
      title: 'Property Registration',
      description: 'Property owners securely upload and register their real estate documents on the Midnight blockchain, creating an immutable record of ownership.',
    },
    {
      icon: Coins,
      number: '02',
      title: 'Tokenization',
      description: 'The property is divided into digital tokens representing fractional ownership shares, enabling liquidity and accessibility for investors.',
    },
    {
      icon: Shield,
      number: '03',
      title: 'Private Trading',
      description: 'Trade property tokens with complete privacy using Midnight\'s shielded transactions, ensuring confidentiality while maintaining regulatory compliance.',
    },
    {
      icon: CheckCircle,
      number: '04',
      title: 'ZK Verification',
      description: 'Generate zero-knowledge proofs to verify ownership and transaction validity without revealing sensitive property or personal information.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            How BrickChain Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform traditional real estate into liquid, tradable assets through secure blockchain tokenization
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-background border-2 border-foreground rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-foreground">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-foreground/10 text-foreground px-6 py-3 rounded-full">
            <Shield className="w-5 h-5" />
            <span className="font-medium">Powered by Midnight Blockchain for Privacy & Security</span>
          </div>
        </div>
      </div>
    </section>
  );
}