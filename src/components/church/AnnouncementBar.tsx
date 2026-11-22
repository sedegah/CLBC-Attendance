import { Clock, MapPin, Phone } from "lucide-react";

export const AnnouncementBar = () => {

  return (
    <aside aria-label="Church announcements and quick contact info" className="bg-[#0F3E6B] text-white text-xs sm:text-[13px] py-2 px-4 sm:px-8 lg:px-12 border-b border-[#164C80]">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Service Schedule */}
        <div className="flex items-center gap-2 text-white/90 font-medium">
          <Clock className="w-3.5 h-3.5 text-[#388CD4] flex-shrink-0" />
          <span>
            <strong className="text-white">Sunday Worship:</strong> 8:00 AM &amp; 10:30 AM
          </span>
          <span className="text-white/40 hidden md:inline">|</span>
          <span className="hidden md:inline">
            <strong className="text-white">Midweek Study:</strong> Wed 6:30 PM
          </span>
        </div>

        {/* Location & Quick Contact */}
        <div className="flex items-center gap-3 sm:gap-5 text-white/85 text-xs">
          <div className="hidden lg:flex items-center gap-1.5 hover:text-white transition-colors">
            <MapPin className="w-3.5 h-3.5 text-[#388CD4]" />
            <span>Ashongman Estate, Accra, Ghana</span>
          </div>
          <a 
            href="tel:+233241234567" 
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#388CD4]" />
            <span>+233 (0) 24 123 4567</span>
          </a>
        </div>
      </div>
    </aside>
  );
};
