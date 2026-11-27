import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Testimonials: React.FC = () => {
  const { testimonials, siteContent } = useStore();
  const { testimonialEyebrow, testimonialHeading, testimonialSubtitle } =
    siteContent.catalogHeaders;

  // Take top 2 published testimonials for compact layout as in Stitch design
  const displayedReviews = testimonials
    .filter((rev) => rev.isPublished)
    .slice(0, 2);

  return (
    <div className="lg:col-span-5 flex flex-col">
      <div className="border-b border-[#E2E8E5] pb-4 mb-6">
        <span className="text-label-caps text-[#3A6B5C] uppercase tracking-widest block mb-1 font-semibold">
          {testimonialEyebrow}
        </span>
        <h2 className="font-headline text-2xl lg:text-3xl text-[#18221E] font-semibold tracking-tight">
          {testimonialHeading}
        </h2>
        <p className="text-xs sm:text-sm text-[#52605A] mt-1">
          {testimonialSubtitle}
        </p>
      </div>

      {/* Testimonial Cards List */}
      <div className="flex flex-col gap-4">
        {displayedReviews.map((rev) => {
          const starsCount = Math.max(1, Math.min(5, Math.round(rev.rating || 5)));
          return (
            <div
              key={rev.id}
              className="bg-white border border-[#E2E8E5] p-5 transition-colors hover:border-[#18221E]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-[#C4841D]">
                  {[...Array(starsCount)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#C4841D]" />
                  ))}
                </div>
                <span className="text-label-code text-[#3A6B5C] flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Order
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#18221E] italic mb-3 leading-relaxed">
                &ldquo;{rev.content}&rdquo;
              </p>

              <div className="flex items-center justify-between border-t border-[#E2E8E5] pt-2 text-label-code">
                <span className="font-semibold text-[#18221E]">{rev.author}</span>
                <span className="text-[#52605A]">
                  {rev.role} — {rev.city}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
