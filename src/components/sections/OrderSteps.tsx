import React from 'react';
import { useStore } from '../../context/StoreContext';

export const OrderSteps: React.FC = () => {
  const { siteContent } = useStore();
  const { eyebrow, heading, hoursBadge, steps } = siteContent.orderSteps;

  return (
    <section className="w-full border-b border-[#E2E8E5] bg-white py-8 lg:py-12" id="alur-pemesanan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#E2E8E5] mb-5 sm:mb-6">
          <div>
            <span className="text-label-caps text-[#3A6B5C] uppercase tracking-widest block mb-1 font-semibold">
              {eyebrow}
            </span>
            <h2 className="font-headline text-xl sm:text-2xl lg:text-3xl text-[#18221E] font-semibold tracking-tight">
              {heading}
            </h2>
          </div>
          <span className="text-label-code text-[#52605A] text-xs">
            {hoursBadge}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5 items-stretch">
          {steps.map((item) => (
            <div
              key={item.step}
              className="bg-[#F1F5F3] border border-[#E2E8E5] p-4 sm:p-5 lg:p-6 flex flex-col justify-between h-full transition-colors hover:border-[#18221E]"
            >
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-label-caps text-[#3A6B5C] font-bold text-[11px] sm:text-xs">
                    LANGKAH {item.step}
                  </span>
                  <span
                    className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-label-code font-bold text-xs ${
                      item.isHighlight
                        ? 'bg-[#3A6B5C] text-white'
                        : 'bg-[#18221E] text-white'
                    }`}
                  >
                    {item.num}
                  </span>
                </div>
                <h3 className="font-headline text-sm sm:text-base lg:text-lg text-[#18221E] font-semibold mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#52605A] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
