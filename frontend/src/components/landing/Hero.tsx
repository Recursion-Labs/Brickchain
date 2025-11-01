/* eslint-disable @next/next/no-img-element */
import { PlayCircleIcon, ZapIcon } from "lucide-react";

import { SpringButton } from "@/components/custom/spring-button";
import { TiltCard } from "@/components/custom/tilt-card";

const Hero = () => {
  return (
    <div className="container mx-auto overflow-hidden p-4 sm:p-6 lg:p-12 xl:p-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid h-full grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 flex flex-col items-center justify-center text-center lg:order-1">
            <div className="bg-background flex items-center gap-1.5 rounded-full py-1 ps-1 pe-3 text-sm border border-foreground">
              <div className="bg-foreground text-background rounded-full p-1">
                <ZapIcon className="size-4" />
              </div>
              <p>Built for property tokenization</p>
            </div>
            <div className="mt-3 text-2xl leading-[1.25] font-semibold sm:text-3xl lg:text-4xl text-left">
              Tokenize Real Estate with Privacy-First Blockchain
            </div>
            <p className="text-foreground/80 mt-3 max-w-lg max-sm:text-sm lg:mt-5">
              Transform property ownership into fractional, tradable digital assets.
              Trade real estate shares privately and securely using zero-knowledge proofs
              on the Midnight blockchain.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4 sm:pt-6">
              <a href="/waitlist" className="bg-primary text-primary-foreground cursor-pointer overflow-hidden rounded-full py-2 ps-4 pe-5 font-medium inline-flex items-center justify-center">
                Join Waitlist
              </a>
              <SpringButton
                shaking={false}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-foreground px-4 py-2 font-medium shadow-none text-foreground"
              >
                Watch Demo
                <PlayCircleIcon className="size-4.5" />
              </SpringButton>
            </div>
            <div className="flex items-center justify-center gap-2 pt-4 lg:pt-6">
              <div className="flex -space-x-4 *:transition-all *:duration-300 *:hover:-translate-y-2">
                <img
                  src="/images/avatars/1.jpg"
                  alt="Avatar"
                  className="border-background size-10 rounded-full border-4 sm:size-12"
                />
                <img
                  src="/images/avatars/2.jpg"
                  alt="Avatar"
                  className="border-background size-10 rounded-full border-4 sm:size-12"
                />
                <img
                  src="/images/avatars/3.jpg"
                  alt="Avatar"
                  className="border-background size-10 rounded-full border-4 sm:size-12"
                />
              </div>
              <div>
                <p className="font-medium">100+</p>
                <p className="text-muted-foreground line-clamp-1 text-sm leading-none max-sm:text-xs">
                  Properties tokenized
                </p>
              </div>
            </div>
          </div>

          <TiltCard
            wrapperClassName="order-1 lg:order-2"
            className="bg-background rounded-md p-2"
          >
            <img
              src="https://images.unsplash.com/photo-1674027392842-29f8354e236c?w=1000"
              className="h-80 w-full rounded-md object-cover sm:h-90 lg:h-100"
              alt="Hero Image"
            />
          </TiltCard>
        </div>
      </div>
    </div>
  );
};

export default Hero;
