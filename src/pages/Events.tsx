import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  CalendarPlus,
  Clock,
  HeartHandshake,
  MapPin,
} from "lucide-react";
import { AnnouncementBar } from "@/components/church/AnnouncementBar";
import { Navigation } from "@/components/Navigation";
import { ChurchFooter } from "@/components/church/ChurchFooter";
import { GiveOnlineModal } from "@/components/church/GiveOnlineModal";
import { getGoogleCalendarUrl, upcomingEvents } from "@/data/events";

const weeklyGatherings = [
  { label: "Sunday Worship", time: "8:00 AM & 10:30 AM" },
  { label: "Wednesday Bible Study", time: "6:30 PM" },
  { label: "Friday Prayer Meeting", time: "7:00 PM" },
];

const Events = () => {
  const [giveModalOpen, setGiveModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-[#1B2430] selection:bg-[#0F3E6B] selection:text-white">
      <AnnouncementBar />

      <Navigation
        variant="default"
        onGiveOnline={() => setGiveModalOpen(true)}
      />

      <main className="flex-1">
        {/* Page hero */}
        <section className="relative overflow-hidden bg-[#0F3E6B] px-4 pb-16 pt-12 text-white sm:px-8 sm:pb-20 sm:pt-16 lg:px-12">
          <div className="pointer-events-none absolute -right-16 top-0 h-80 w-80 rounded-full bg-[#1F6FB5]/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-10 h-64 w-64 rounded-full bg-[#082A4B]/40 blur-2xl" />

          <div className="relative z-10 mx-auto max-w-7xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#DBE7F5]">
              <Calendar className="h-3.5 w-3.5 text-[#388CD4]" />
              Church calendar
            </div>

            <h1 className="mt-5 font-serif text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[60px]">
              Upcoming events
              <br />
              <span className="text-[#DBE7F5]">&amp; gatherings</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#DBE7F5] sm:text-lg">
              Join us for special gatherings, outreaches, and services. Everyone is warmly
              invited.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#BCD6F2] sm:text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#388CD4]" />
                Ashongman Estate, Accra, Ghana
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#388CD4]" />
                Sunday Worship at 8:00 AM &amp; 10:30 AM
              </span>
            </div>
          </div>
        </section>

        {/* Events list & sidebar */}
        <section className="bg-[#F4F7FB] px-4 py-14 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.55fr_0.85fr] lg:gap-12">
            <div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#C62828]">
                    What&apos;s coming up
                  </span>
                  <h2 className="mt-2 font-serif text-3xl font-bold text-[#0F3E6B] sm:text-4xl">
                    Mark your calendar
                  </h2>
                </div>
                <span className="hidden pb-1 text-xs font-medium text-slate-500 sm:block">
                  {upcomingEvents.length} events scheduled
                </span>
              </div>

              <div className="mt-6 space-y-4">
                {upcomingEvents.map((event) => {
                  const [month, day] = event.date.split(" ");

                  return (
                    <article
                      key={event.id}
                      className="rounded-2xl border border-[#E6E9EE] bg-white p-5 shadow-[0_4px_16px_rgba(15,62,107,0.04)] transition-shadow hover:shadow-md sm:p-6"
                    >
                      <div className="flex gap-4 sm:gap-5">
                        <div
                          className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-xl text-white shadow-sm"
                          style={{ backgroundColor: event.color }}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                            {month}
                          </span>
                          <span className="text-xl font-bold leading-none">{day}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="font-serif text-lg font-bold leading-snug text-[#0F3E6B] sm:text-xl">
                                {event.title}
                              </h3>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#4A5565] sm:text-sm">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-[#1F6FB5]" />
                                  {event.time}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-[#1F6FB5]" />
                                  {event.location}
                                </span>
                              </div>
                            </div>

                            <a
                              href={getGoogleCalendarUrl(event)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-full border border-[#0F3E6B]/20 bg-white px-3.5 py-2 text-xs font-semibold text-[#0F3E6B] transition-colors hover:border-[#0F3E6B]/40 hover:bg-[#F4F7FB]"
                            >
                              <CalendarPlus className="h-3.5 w-3.5" />
                              Add to calendar
                            </a>
                          </div>

                          <p className="mt-3 text-sm leading-relaxed text-[#4A5565]">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="space-y-6 self-start lg:sticky lg:top-28">
              <div className="rounded-2xl bg-[#0F3E6B] p-6 text-white shadow-[0_18px_40px_rgba(15,62,107,0.16)] sm:p-7">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#388CD4]">
                  Every week
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold">Weekly gatherings</h3>

                <div className="mt-5">
                  {weeklyGatherings.map((gathering, index) => (
                    <div
                      key={gathering.label}
                      className={`flex items-center justify-between gap-4 py-3.5 ${
                        index < weeklyGatherings.length - 1 ? "border-b border-white/15" : ""
                      }`}
                    >
                      <span className="text-sm text-[#C9D9EC]">{gathering.label}</span>
                      <span className="text-sm font-semibold text-white">{gathering.time}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/visit"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#DBE7F5] transition-colors hover:text-white"
                >
                  Service times &amp; directions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-[#DCE8F4] bg-[#EAF2F9] p-6 sm:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#C62828] text-white">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold text-[#0F3E6B]">
                  Planning your first visit?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  We would love to welcome you this Sunday. Find our location, service times, and
                  how to reach the pastoral team.
                </p>
                <Link
                  to="/visit"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C62828] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B71C1C]"
                >
                  Visit &amp; directions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <ChurchFooter />

      <GiveOnlineModal
        open={giveModalOpen}
        onOpenChange={setGiveModalOpen}
      />
    </div>
  );
};

export default Events;
