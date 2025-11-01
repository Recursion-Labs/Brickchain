import { Header } from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
// import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import { FAQs } from "@/components/landing/FAQs";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <div className="container mx-auto px-4">
        {/* <Features /> */}
        <HowItWorks />
      </div>
      <FAQs />
      <Footer />
    </div>
  );
}
