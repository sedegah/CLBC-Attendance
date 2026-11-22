import { Calendar, Clock, MapPin, ArrowRight, BookOpen, HeartHandshake } from "lucide-react";

interface ServiceTimesCardsProps {
  onPlanVisit: () => void;
  onPrayerRequest: () => void;
}

export const ServiceTimesCards = ({ onPlanVisit, onPrayerRequest }: ServiceTimesCardsProps) => {
  return (
    <section id="services" className="bg-[#F4F7FB] px-4 sm:px-8 lg:px-12 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -translate-y-9 sm:-translate-y-12">
          {/* Card 1: Sunday Worship */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border-t-[5px] border-[#C62828] shadow-[0_8px_24px_rgba(15,62,107,0.08)] hover:shadow-[0_12px_32px_rgba(15,62,107,0.12)] transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C62828] bg-red-50 px-2.5 py-1 rounded-full">
                  Weekly Celebration
                </span>
                <Calendar className="w-5 h-5 text-[#C62828]" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#0F3E6B] group-hover:text-[#C62828] transition-colors">
                Sunday Worship
              </h3>

              <div className="space-y-1 text-sm text-[#4A5565]">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1F6FB5]" />
                  <span>8:00 AM &amp; 10:30 AM</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-[#1F6FB5]" />
                  <span>Main Sanctuary &amp; Online</span>
                </div>
              </div>

              <p className="text-sm text-[#4A5565] leading-relaxed pt-1">
                Come as you are. Join us for joyful congregational praise, prayer, and inspiring Bible teaching for all ages.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <button
                onClick={onPlanVisit}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F3E6B] hover:text-[#C62828] transition-colors"
              >
                <span>Plan to join this Sunday</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Card 2: Midweek Bible Study */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border-t-[5px] border-[#1F6FB5] shadow-[0_8px_24px_rgba(15,62,107,0.08)] hover:shadow-[0_12px_32px_rgba(15,62,107,0.12)] transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F6FB5] bg-blue-50 px-2.5 py-1 rounded-full">
                  Discipleship
                </span>
                <BookOpen className="w-5 h-5 text-[#1F6FB5]" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#0F3E6B] group-hover:text-[#1F6FB5] transition-colors">
                Midweek Bible Study
              </h3>

              <div className="space-y-1 text-sm text-[#4A5565]">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1F6FB5]" />
                  <span>Wednesdays at 6:30 PM</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-[#1F6FB5]" />
                  <span>Fellowship Hall &amp; Livestream</span>
                </div>
              </div>

              <p className="text-sm text-[#4A5565] leading-relaxed pt-1">
                Open to all ages. An interactive time of verse-by-verse scripture study, practical life questions, and prayer.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <button
                onClick={onPlanVisit}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F3E6B] hover:text-[#1F6FB5] transition-colors"
              >
                <span>Join our Midweek study</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Card 3: Prayer Meeting */}
          <div className="bg-white rounded-2xl p-6 sm:p-7 border-t-[5px] border-[#C62828] shadow-[0_8px_24px_rgba(15,62,107,0.08)] hover:shadow-[0_12px_32px_rgba(15,62,107,0.12)] transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C62828] bg-red-50 px-2.5 py-1 rounded-full">
                  Spiritual Power
                </span>
                <HeartHandshake className="w-5 h-5 text-[#C62828]" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#0F3E6B] group-hover:text-[#C62828] transition-colors">
                Prayer Meeting
              </h3>

              <div className="space-y-1 text-sm text-[#4A5565]">
                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#C62828]" />
                  <span>Fridays at 7:00 PM</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
                  <span>Prayer Chapel</span>
                </div>
              </div>

              <p className="text-sm text-[#4A5565] leading-relaxed pt-1">
                Bring your burdens and prayer requests. Corporate intercession for our families, church, and community.
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100">
              <button
                onClick={onPrayerRequest}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0F3E6B] hover:text-[#C62828] transition-colors"
              >
                <span>Submit a prayer request</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
