import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../components/sections/HeroSection';
import { TrustMetrics } from '../components/sections/TrustMetrics';
import { ProductCatalog } from '../components/sections/ProductCatalog';

// Asynchronous Below-The-Fold Sections
// Dynamically imported on user interaction (scroll, touch, mousemove) to guarantee minimal TBT on Landing Page
const PackageBundles = lazy(() =>
  import('../components/sections/PackageBundles').then((m) => ({ default: m.PackageBundles }))
);
const BentoAdvantages = lazy(() =>
  import('../components/sections/BentoAdvantages').then((m) => ({ default: m.BentoAdvantages }))
);
const OrderSteps = lazy(() =>
  import('../components/sections/OrderSteps').then((m) => ({ default: m.OrderSteps }))
);
const Testimonials = lazy(() =>
  import('../components/sections/Testimonials').then((m) => ({ default: m.Testimonials }))
);
const FAQSection = lazy(() =>
  import('../components/sections/FAQSection').then((m) => ({ default: m.FAQSection }))
);
const FinalCTA = lazy(() =>
  import('../components/sections/FinalCTA').then((m) => ({ default: m.FinalCTA }))
);
const Footer = lazy(() =>
  import('../components/layout/Footer').then((m) => ({ default: m.Footer }))
);
const FloatingActions = lazy(() =>
  import('../components/ui/FloatingActions').then((m) => ({ default: m.FloatingActions }))
);

export const LandingPage: React.FC = () => {
  const [renderBelowFold, setRenderBelowFold] = useState(false);

  useEffect(() => {
    const handleUserInteraction = () => {
      setRenderBelowFold(true);
    };

    window.addEventListener('scroll', handleUserInteraction, { passive: true, once: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true, once: true });
    window.addEventListener('mousemove', handleUserInteraction, { passive: true, once: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true, once: true });

    // Fallback: render after 6s of complete inactivity
    const timer = setTimeout(handleUserInteraction, 6000);

    return () => {
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#18221E] flex flex-col antialiased selection:bg-[#B9EEDA] selection:text-[#18221E]">
      {/* 1. Critical Header, Hero & Product Catalog */}
      <Navbar />

      <main className="flex-grow">
        <HeroSection />
        <TrustMetrics />
        <ProductCatalog />

        {/* 2. Deep Below-The-Fold Sections Mounted On Demand */}
        {renderBelowFold && (
          <Suspense fallback={null}>
            <PackageBundles />
            <BentoAdvantages />
            <OrderSteps />

            <section
              className="w-full border-b border-[#E2E8E5] bg-[#F8FAF9] py-8 lg:py-12"
              id="faq-testimoni"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
                  <Testimonials />
                  <FAQSection />
                </div>
              </div>
            </section>

            <FinalCTA />
          </Suspense>
        )}
      </main>

      {/* 3. Deferred Footer & Floating Actions */}
      {renderBelowFold && (
        <Suspense fallback={null}>
          <Footer />
          <FloatingActions />
        </Suspense>
      )}
    </div>
  );
};
