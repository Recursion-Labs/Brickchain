'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MinusIcon, PlusIcon } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'technical' | 'support';
}

const faqItems: FaqItem[] = [
  {
    id: '1',
    question: 'What product does BrickChain offer?',
    answer:
      'BrickChain provides a platform to tokenize real estate assets into fractional, tradable tokens on the Midnight blockchain. The product focuses on privacy-first token issuance, private secondary trading, and compliance tools for property issuers and investors.',
    category: 'general',
  },
  {
    id: '2',
    question: 'Who can tokenize a property on BrickChain?',
    answer:
      'Property owners, asset managers, and authorized custodians can tokenize properties. Issuers must provide required legal documents and complete the onboarding checklist so the asset can be represented by tokenized shares.',
    category: 'support',
  },
  {
    id: '3',
    question: 'How is ownership represented?',
    answer:
      'Ownership is represented by ERC-20/ERC-1400 style tokens (fractional shares) minted against the property. Each token maps to a share of the asset and is backed by hashed legal documents stored off-chain with verifiable commitments on-chain.',
    category: 'technical',
  },
  {
    id: '4',
    question: 'What steps are required to list a property?',
    answer:
      'Listing requires: (1) onboarding and KYC for the issuer, (2) uploading and notarizing property documents, (3) setting token economics (supply, price, fees), and (4) minting the tokenized shares. Our dashboard guides issuers through each step.',
    category: 'support',
  },
  {
    id: '5',
    question: 'Are trades private?',
    answer:
      'Yes — BrickChain leverages zero-knowledge proofs and Midnight\'s shielded transaction primitives so trades can be executed without revealing buyer, seller, or amounts to the public chain while preserving auditability for authorized parties.',
    category: 'technical',
  },
  {
    id: '6',
    question: 'What fees should issuers and investors expect?',
    answer:
      'Fees include a small platform listing fee, minting/gas fees, and optional marketplace fees on secondary trades. Exact numbers depend on the asset and the configured token economics; fee details are shown during listing and in the issuer dashboard.',
    category: 'pricing',
  },
  {
    id: '7',
    question: 'How do you handle compliance and KYC?',
    answer:
      'BrickChain integrates optional KYC/AML checks for issuers and investors. Compliance data is stored off-chain and referenced via cryptographic commitments; regulators can be granted selective disclosure with ZK-based proofs where required.',
    category: 'technical',
  },
  {
    id: '8',
    question: 'Can investors liquidate positions?',
    answer:
      'Yes — investors can list fractional tokens on BrickChain\'s private marketplace or transfer them peer-to-peer using shielded transactions. Liquidity depends on market demand and any issuer-imposed transfer restrictions.',
    category: 'general',
  },
  {
    id: '9',
    question: 'How is sensitive document data protected?',
    answer:
      'Sensitive documents are stored off-chain in encrypted storage (IPFS/secure S3) and only cryptographic hashes or commitments are anchored on-chain. Access to documents is controlled and can be shared with verified parties only.',
    category: 'technical',
  },
  {
    id: '10',
    question: 'What wallet support do you provide?',
    answer:
      'BrickChain supports common Web3 wallets that are compatible with Midnight. We also provide guidance for custodial integrations for institutional users who prefer managed custody.',
    category: 'support',
  },
  {
    id: '11',
    question: 'Is BrickChain suitable for institutional issuers?',
    answer:
      'Yes — the platform includes issuer dashboards, compliance tooling, private marketplaces, and APIs to integrate with custodians and fund administrators to meet institutional workflows.',
    category: 'general',
  },
  {
    id: '12',
    question: 'Where can I get help or request a demo?',
    answer:
      'Visit our Contact Support link or request a demo via the Get Started / Whitelist flow. Our support team will help with onboarding, technical integration, and enterprise inquiries.',
    category: 'support',
  },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'technical', label: 'Technical' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'support', label: 'Support' },
];

function FAQs() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredFaqs =
    activeCategory === 'all'
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-12 flex flex-col items-center">
          <Badge
            variant="outline"
            className="border-primary mb-4 px-3 py-1 text-xs font-medium tracking-wider uppercase"
          >
            FAQs
          </Badge>

          <h2 className="text-foreground mb-6 text-center text-4xl font-bold tracking-tight md:text-5xl">
            Frequently Asked Questions
          </h2>

          <p className="text-muted-foreground max-w-2xl text-center">
            Find answers to common questions about BrickChain and how to tokenize real estate
            with privacy-first blockchain technology.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
              )}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <AnimatePresence>
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  'border-border h-fit overflow-hidden rounded-xl border',
                  expandedId === faq.id
                    ? 'shadow-3xl bg-card/50'
                    : 'bg-card/50',
                )}
                style={{ minHeight: '88px' }}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <h3 className="text-foreground text-lg font-medium">
                    {faq.question}
                  </h3>
                  <div className="ml-4 shrink-0">
                    {expandedId === faq.id ? (
                      <MinusIcon className="text-primary h-5 w-5" />
                    ) : (
                      <PlusIcon className="text-primary h-5 w-5" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-border border-t px-6 pt-2 pb-6">
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <a
            href="#"
            className="border-primary text-foreground hover:bg-primary hover:text-primary-foreground inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 font-medium transition-colors"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export { FAQs };