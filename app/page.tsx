import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { StatStrip } from "@/components/landing/stat-strip";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhatYouGet } from "@/components/landing/what-you-get";
import { InsightsPreview } from "@/components/landing/insights-preview";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { WhoItsFor } from "@/components/landing/who-its-for";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatStrip />
        <HowItWorks />
        <WhatYouGet />
        <InsightsPreview />
        <DashboardPreview />
        <WhoItsFor />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
