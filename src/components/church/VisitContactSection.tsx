import { MapPin, Phone, Mail, Clock, Send, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisitContactSectionProps {
  onPlanVisit: () => void;
  onPrayerRequest: () => void;
}

export const VisitContactSection = ({ onPlanVisit, onPrayerRequest }: VisitContactSectionProps) => {
  return (
    <section id="contact" className="py-16 sm:py-20 px-4 sm:px-8 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Location & Times Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6FB5] bg-blue-50 px-3 py-1 rounded-full">
                Visit &amp; Connect
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F3E6B]">
                We'd love to welcome you
              </h2>
              <p className="text-[#4A5565] text-sm sm:text-base leading-relaxed">
                Whether visiting for the first time or returning, our doors and hearts are open. Reach out to our pastoral team or join us this Sunday.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5 bg-[#F4F7FB] border border-[#E6E9EE] p-4 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-[#0F3E6B] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0F3E6B]">Church Location</div>
                  <div className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Changed Life Baptist Church Campus<br />
                    Achimota - Mile 7, Near Main Highway, Accra, Ghana
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-[#F4F7FB] border border-[#E6E9EE] p-4 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-[#1F6FB5] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0F3E6B]">Service Hours</div>
                  <div className="text-xs sm:text-sm text-slate-600 mt-0.5 space-y-0.5">
                    <div>Sunday First Service: <strong>8:00 AM - 10:00 AM</strong></div>
                    <div>Sunday Second Service: <strong>10:30 AM - 12:30 PM</strong></div>
                    <div>Wednesday Bible Study: <strong>6:30 PM - 8:00 PM</strong></div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 bg-[#F4F7FB] border border-[#E6E9EE] p-4 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-[#C62828] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[#0F3E6B]">Call &amp; Pastoral Support</div>
                  <div className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Tel / WhatsApp: +233 (0) 24 123 4567<br />
                    Email: info@changedlifebaptist.org
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Connect & Prayer Card */}
          <div className="bg-[#F4F7FB] border border-[#E6E9EE] rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C62828]">
                Connect With Pastors
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#0F3E6B]">
                How can we pray for you today?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Our church family believes in the power of united prayer. Share your prayer request or plan a first-time visit with our hospitality team.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                onClick={onPrayerRequest}
                className="w-full bg-[#0F3E6B] hover:bg-[#164C80] text-white font-semibold py-3 rounded-xl shadow-md gap-2"
              >
                <HeartHandshake className="w-4 h-4 text-[#388CD4]" />
                <span>Submit a Prayer Request</span>
              </Button>

              <Button
                onClick={onPlanVisit}
                variant="outline"
                className="w-full bg-white hover:bg-slate-50 text-[#C62828] border-[#C62828]/40 hover:border-[#C62828] font-semibold py-3 rounded-xl shadow-sm gap-2"
              >
                <Send className="w-4 h-4 text-[#C62828]" />
                <span>Plan Your Visit This Weekend</span>
              </Button>
            </div>

            <div className="pt-2 border-t border-slate-200 text-center text-xs text-slate-500">
              Need immediate pastoral counseling? Call our helpline at <strong>+233 24 123 4567</strong>.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
