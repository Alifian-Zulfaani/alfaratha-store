import React from 'react';
import { ShieldCheck, Package, Snowflake, Plane } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SiteTrustMetricItem } from '../../types';

const ICON_MAP: Record<SiteTrustMetricItem['iconName'], React.FC<{ className?: string }>> = {
  shield: ShieldCheck,
  package: Package,
  snowflake: Snowflake,
  plane: Plane,
};

export const TrustMetrics: React.FC = () => {
  const { siteContent } = useStore();
  const metrics = siteContent.trustMetrics.items;

  return (
    <section className="w-full bg-[#F8FAF9] border-b border-[#E2E8E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#E2E8E5] border border-[#E2E8E5]">
          {metrics.map((item, idx) => {
            const Icon = ICON_MAP[item.iconName] || ShieldCheck;
            return (
              <div
                key={`${item.title}-${idx}`}
                className="bg-white p-4 sm:p-5 flex flex-col gap-1.5 transition-colors hover:bg-[#F1F5F3]"
              >
                <div className="flex items-center gap-2 text-[#3A6B5C]">
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-label-caps uppercase tracking-wider text-[#52605A]">
                    {item.badge}
                  </span>
                </div>
                <p className="font-headline text-base sm:text-lg text-[#18221E] font-semibold leading-snug">
                  {item.title}
                </p>
                <p className="text-xs sm:text-sm text-[#52605A] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
