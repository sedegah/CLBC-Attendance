import { Play, Calendar, Clock, MapPin, ArrowRight } from "lucide-react";

interface SermonsAndEventsSectionProps {
  onWatchSermon: () => void;
  onViewAllEvents: () => void;
}

export const SermonsAndEventsSection = ({
  onWatchSermon,
  onViewAllEvents,
}: SermonsAndEventsSectionProps) => {
  const latestMessage = {
    title: "Walking in Grace and Supernatural Power",
    preacher: "Rev. Senior Pastor",
    date: "Sunday Celebration Service",
    scripture: "Colossians 2:6-7",
  };

  const upcomingEvents = [
    {
      date: "DEC 04",
      color: "#1F6FB5",
      title: "Night of Worship & Prophetic Prayer",
      time: "7:00 PM",
      location: "Main Sanctuary",
    },
    {
      date: "DEC 11",
      color: "#C62828",
      title: "Community Christmas Outreach",
      time: "10:00 AM",
      location: "Church Grounds",
    },
    {
      date: "DEC 18",
      color: "#1F6FB5",
      title: "Crossroads Youth & Young Adults Fellowship",
      time: "5:30 PM",
      location: "Youth Chapel",
    },
  ];

  return (
    <section id="watch" className="bg-[#F4F7FB] py-16 sm:py-20 px-4 sm:px-8 lg:px-12 border-b border-[#E6E9EE]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16">
        {/* Left Column: Latest Message */}
        <div className="flex-1 lg:max-w-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3E6B]">
              Latest message
            </h3>
            <span className="text-xs font-semibold text-[#1F6FB5] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/50">
              Recent Service
            </span>
          </div>

          {/* 16:9 Video Container */}
          <div
            onClick={onWatchSermon}
            className="group relative aspect-video rounded-2xl bg-[#0F3E6B] shadow-lg flex items-center justify-center cursor-pointer overflow-hidden border border-slate-200/60"
          >
            {/* Background lighting */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#082A4B] via-[#0F3E6B] to-[#1F6FB5]/40 opacity-90 group-hover:scale-105 transition-transform duration-500" />
            
            {/* Play Button matching mockup: 84px circle with red play icon */}
            <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden="true" className="ml-1">
                <path d="M8 5v14l11-7z" fill="#C62828" />
              </svg>
            </div>

            {/* Badge overlay */}
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-md">
              Watch Message &amp; Notes
            </div>
          </div>

          {/* Message Meta */}
          <div className="space-y-1 pt-1">
            <h4
              onClick={onWatchSermon}
              className="font-serif text-xl sm:text-2xl font-bold text-[#0F3E6B] hover:text-[#C62828] transition-colors cursor-pointer"
            >
              {latestMessage.title}
            </h4>
            <div className="text-sm text-[#4A5565] flex items-center gap-2">
              <span className="font-medium">{latestMessage.preacher}</span>
              <span>·</span>
              <span>{latestMessage.date}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Events */}
        <div id="events" className="flex-1 lg:max-w-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F3E6B]">
              Upcoming events
            </h3>
            <span className="text-xs text-slate-500">Upcoming Schedule</span>
          </div>

          {/* Events list */}
          <div className="space-y-3.5">
            {upcomingEvents.map((event, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-4 sm:p-4.5 flex items-center gap-4 border border-slate-100 shadow-[0_4px_16px_rgba(15,62,107,0.04)] hover:shadow-md transition-shadow group"
              >
                {/* Date badge matching mockup */}
                <div
                  className="min-w-[64px] text-center rounded-xl py-2 px-1 text-white font-bold text-xs flex flex-col justify-center flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: event.color }}
                >
                  <span className="text-[10px] tracking-wider opacity-90">
                    {event.date.split(" ")[0]}
                  </span>
                  <span className="text-lg leading-tight">
                    {event.date.split(" ")[1]}
                  </span>
                </div>

                {/* Event info */}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm sm:text-base text-[#0F3E6B] leading-snug group-hover:text-[#1F6FB5] transition-colors truncate">
                    {event.title}
                  </div>
                  <div className="text-xs sm:text-sm text-[#4A5565] flex items-center gap-2 mt-0.5">
                    <span>{event.time}</span>
                    <span>·</span>
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View all events link */}
          <div className="pt-2">
            <button
              onClick={onViewAllEvents}
              className="inline-flex items-center gap-1.5 font-semibold text-sm sm:text-base text-[#1F6FB5] hover:text-[#0F3E6B] border-b-2 border-[#1F6FB5] pb-0.5 transition-colors cursor-pointer group"
            >
              <span>View all events</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
