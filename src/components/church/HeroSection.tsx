import { Play, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import { WorshipArchSvg } from "./WorshipArchSvg";

interface HeroSectionProps {
  onPlanVisit: () => void;
  onWatchOnline: () => void;
}

export const HeroSection = ({ onPlanVisit, onWatchOnline }: HeroSectionProps) => {
  return (
    <section className="relative bg-[#0F3E6B] text-white pt-10 sm:pt-14 md:pt-16 pb-20 sm:pb-24 lg:pb-28 px-4 sm:px-8 lg:px-12 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#1F6FB5]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 rounded-full bg-[#082A4B]/40 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 sm:gap-14 lg:gap-16 relative z-10">
        {/* Left Column: Headline and Call to Actions */}
        <div className="flex-1 max-w-2xl text-center lg:text-left">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#BCD6F2] mb-4 sm:mb-5 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-[#388CD4] animate-pulse" />
            <span>Welcome home. Serving Christ since 1976.</span>
          </div>

          {/* Main Title in Fraunces serif */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold leading-[1.06] tracking-tight mb-5 sm:mb-6 text-white">
            A Changed Life<br />
            <span className="text-white">For Christ.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-[#DBE7F5] leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto lg:mx-0">
            Join us as we worship, grow in the Word and serve our community together. Everyone is welcome at Changed Life Baptist Church.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 sm:gap-4">
            <button
              onClick={onPlanVisit}
              className="inline-flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] active:scale-[0.98] text-white font-semibold text-sm sm:text-base px-7 sm:px-9 py-3.5 sm:py-4 rounded-full shadow-lg shadow-[#C62828]/25 hover:shadow-xl transition-all duration-200 cursor-pointer min-h-[46px]"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Plan Your Visit</span>
            </button>

            <button
              onClick={onWatchOnline}
              className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 active:scale-[0.98] text-white font-semibold text-sm sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border-2 border-white/90 hover:border-white transition-all duration-200 cursor-pointer min-h-[46px]"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              <span>Watch Online</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="mt-8 sm:mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs sm:text-sm text-[#BCD6F2]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#388CD4]" />
              <span>Biblical Foundation</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>Warm Family Fellowship</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span>All Generations Welcome</span>
            </div>
          </div>
        </div>

        {/* Right Column: Worship Arch SVG Artwork */}
        <div className="flex-1 w-full flex justify-center items-center lg:justify-end">
          <div className="relative group">
            {/* Subtle backlight glow */}
            <div className="absolute inset-0 bg-[#1F6FB5]/20 rounded-full blur-2xl transform scale-90 group-hover:scale-100 transition-transform duration-500 pointer-events-none" />
            <WorshipArchSvg
              navy="#0F3E6B"
              blue="#1F6FB5"
              className="relative z-10 w-[280px] xs:w-[320px] sm:w-[380px] md:w-[420px] max-w-full h-auto drop-shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
