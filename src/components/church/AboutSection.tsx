import { CheckCircle2, ArrowRight, ShieldCheck, Heart, Sparkles } from "lucide-react";
import heroChurchImg from "@/assets/hero-church.jpg";

interface AboutSectionProps {
  onLearnMore: () => void;
}

export const AboutSection = ({ onLearnMore }: AboutSectionProps) => {
  return (
    <section id="about" className="bg-[#F4F7FB] py-14 sm:py-20 px-4 sm:px-8 lg:px-12 border-b border-[#E6E9EE]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 sm:gap-14 lg:gap-16">
        {/* Left Column: Congregation Photo & Heritage Card */}
        <div className="flex-1 w-full relative">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/60 group">
            <img
              src={heroChurchImg}
              alt="Changed Life Baptist Church congregation worshipping together"
              className="w-full h-[320px] sm:h-[400px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            {/* Ambient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F3E6B]/80 via-transparent to-transparent opacity-80" />
            
            {/* Overlay Badge */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md rounded-xl p-3.5 sm:p-4 border border-white shadow-lg flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#C62828]">
                  48+ Years of Grace
                </div>
                <div className="font-serif text-sm sm:text-base font-bold text-[#0F3E6B]">
                  Serving Christ Since 1976
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#0F3E6B] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Heart className="w-5 h-5 fill-white" />
              </div>
            </div>
          </div>

          {/* Accent decoration */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#1F6FB5]/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#C62828]/15 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Right Column: Narrative and Pillars */}
        <div className="flex-1 max-w-xl space-y-5 sm:space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1F6FB5] bg-blue-50/80 px-3 py-1 rounded-full border border-blue-200/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Heart &amp; Mission</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-[42px] font-bold text-[#0F3E6B] leading-[1.15]">
            A family of faith, serving since 1976
          </h2>

          <p className="text-base sm:text-lg text-[#3B4656] leading-relaxed">
            Changed Life Baptist Church is a Christ-centered community grounded in God's Holy Word. For nearly five decades, our passion has been to help people know Jesus, grow in spiritual maturity, and impact our surrounding community with grace and compassionate truth.
          </p>

          {/* Value points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#1F6FB5] flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-700">
                <strong className="block text-[#0F3E6B]">Bible-Centered Preaching</strong>
                Expository teaching rooted in scriptures.
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#C62828] flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-slate-700">
                <strong className="block text-[#0F3E6B]">Welcoming Family</strong>
                Loving discipleship across every stage of life.
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onLearnMore}
              className="inline-flex items-center gap-2 font-semibold text-base text-[#1F6FB5] hover:text-[#0F3E6B] border-b-2 border-[#1F6FB5] pb-1 transition-colors cursor-pointer group"
            >
              <span>Learn more about our beliefs and leadership</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
