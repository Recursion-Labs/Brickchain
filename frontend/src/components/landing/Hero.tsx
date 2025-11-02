/* eslint-disable @next/next/no-img-element */
import { PlayCircleIcon, ZapIcon } from "lucide-react";

import { SpringButton } from "@/components/custom/spring-button";
import { TiltCard } from "@/components/custom/tilt-card";

const Hero = () => {
  return (
    <div className="min-h-screen flex items-center overflow-hidden p-2 sm:p-4 lg:p-6 xl:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid h-full grid-cols-1 gap-12 sm:gap-16 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 flex flex-col items-center justify-center text-center lg:order-1">
            <div className="bg-background flex items-center gap-1.5 rounded-full py-2 ps-2 pe-4 text-base border border-foreground">
              <div className="bg-foreground text-background rounded-full p-1.5">
                <ZapIcon className="size-5" />
              </div>
              <p>Built for property tokenization</p>
            </div>
            <div className="mt-6 text-4xl leading-[1.1] font-semibold sm:text-5xl lg:text-6xl xl:text-7xl text-left">
              Tokenize Real Estate with Privacy-First Blockchain
            </div>
            <p className="text-foreground/80 mt-6 max-w-xl text-lg sm:text-xl lg:text-2xl lg:mt-8 text-left">
              Transform property ownership into fractional, tradable digital
              assets. Trade real estate shares privately and securely using
              zero-knowledge proofs on the Midnight blockchain.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-8 sm:pt-10">
              <a
                href="/waitlist"
                className="bg-primary text-primary-foreground cursor-pointer overflow-hidden rounded-full py-4 px-8 text-lg font-medium inline-flex items-center justify-center"
              >
                Join Waitlist
              </a>
              <SpringButton
                shaking={false}
                className="flex cursor-pointer items-center gap-3 rounded-full border border-foreground px-6 py-4 text-lg font-medium shadow-none text-foreground"
              >
                Watch Demo
                <PlayCircleIcon className="size-6" />
              </SpringButton>
            </div>
            <div className="flex items-center justify-center gap-4 pt-8 lg:pt-10">
              <div className="flex -space-x-4 *:transition-all *:duration-300 *:hover:-translate-y-2">
                <img
                  src="https://avatar.iran.liara.run/public/100"
                  alt="Avatar"
                  className="border-background size-14 rounded-full border-4 sm:size-16"
                />
                <img
                  src="https://avatar.iran.liara.run/public/46"
                  alt="Avatar"
                  className="border-background size-14 rounded-full border-4 sm:size-16"
                />
                <img
                  src="https://avatar.iran.liara.run/public/32"
                  alt="Avatar"
                  className="border-background size-14 rounded-full border-4 sm:size-16"
                />
              </div>
              <div>
                <p className="font-semibold text-xl">100+</p>
                <p className="text-muted-foreground line-clamp-1 text-base leading-none">
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
              className="h-[28rem] w-full rounded-md object-cover sm:h-[32rem] lg:h-[40rem]"
              alt="Hero Image"
            />
          </TiltCard>
        </div>
      </div>
    </div>
  );
};

export default Hero;
