import { Heart, Sparkles } from "lucide-react";

interface GivingSectionProps {
  onGiveOnline: () => void;
}

export const GivingSection = ({ onGiveOnline }: GivingSectionProps) => {
  return (
    <section id="give" className="bg-[#C62828] text-white py-16 sm:py-20 px-4 sm:px-8 lg:px-12 text-center relative overflow-hidden">
      {/* Subtle decorative circles */}
      <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase bg-white/20 px-3 py-1 rounded-full text-white backdrop-blur-sm">
          <Heart className="w-3.5 h-3.5 fill-white" />
          <span>Generosity in Action</span>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white max-w-2xl mx-auto">
          Partner with us in the work of Christ
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          Your giving supports worship, outreach, youth development, and benevolent ministry in our local community and beyond.
        </p>

        <div className="pt-3">
          <button
            onClick={onGiveOnline}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 active:scale-[0.98] text-[#C62828] font-bold text-base sm:text-lg px-9 sm:px-11 py-3.5 sm:py-4 rounded-full shadow-2xl hover:shadow-white/20 transition-all duration-200 cursor-pointer min-h-[48px]"
          >
            <Sparkles className="w-5 h-5 text-[#C62828]" />
            <span>Give Online</span>
          </button>
        </div>

        <p className="text-xs text-white/75 pt-2">
          Secure Giving · Mobile Money (MTN &amp; Telecel) · Bank Transfer · Card
        </p>
      </div>
    </section>
  );
};
