import { Link, useLocation } from "react-router-dom";
import clbcLogo from "@/assets/clbc-logo.png";
import { Shield, Heart, MapPin, Phone, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const ChurchFooter = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const sectionHref = (hash: string) => (isHome ? hash : `/${hash}`);

  return (
    <footer className="bg-[#0B2D4F] text-[#C9D9EC] pt-14 sm:pt-16 pb-8 px-4 sm:px-8 lg:px-12 border-t border-[#164C80]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-[#24476B]">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-1.5 shadow-md flex-shrink-0">
                <img
                  src={clbcLogo}
                  alt="Changed Life Baptist Church Logo"
                  className="w-10 h-10 object-contain"
                />
              </span>
              <span className="font-serif text-lg sm:text-xl font-bold text-white leading-tight">
                Changed Life<br />Baptist Church
              </span>
            </div>
            <p className="text-sm text-[#C9D9EC]/90 leading-relaxed pt-1">
              "A Changed Life For Christ." Serving the Lord and nurturing believers since 1976.
            </p>
            <div className="text-xs text-[#8BA9CE] flex items-center gap-1.5 pt-1">
              <Heart className="w-3.5 h-3.5 text-[#C62828] fill-[#C62828]" />
              <span>Gospel · Community · Transformation</span>
            </div>
          </div>

          {/* Column 2: Visit */}
          <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
            <div className="text-white font-bold text-base mb-1 tracking-wide">
              Visit Us
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#388CD4] flex-shrink-0 mt-0.5" />
              <span>
                Ashongman Estate Campus<br />
                Accra, Ghana
              </span>
            </div>
            <div className="pt-2 text-white/90">
              <strong className="block text-white">Sunday Worship:</strong>
              8:00 AM &amp; 10:30 AM
            </div>
            <div className="text-white/90">
              <strong className="block text-white">Midweek Bible Study:</strong>
              Wednesday at 6:30 PM
            </div>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
            <div className="text-white font-bold text-base mb-1 tracking-wide">
              Contact
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#388CD4] flex-shrink-0" />
              <a href="tel:+233241234567" className="hover:text-white transition-colors">
                +233 (0) 24 123 4567
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#388CD4] flex-shrink-0" />
              <a href="mailto:info@changedlifebaptist.org" className="hover:text-white transition-colors">
                info@changedlifebaptist.org
              </a>
            </div>
          </div>

          {/* Column 4: Explore & Portal */}
          <div className="space-y-2.5 text-xs sm:text-sm">
            <div className="text-white font-bold text-base mb-1 tracking-wide">
              Explore
            </div>
            <ul className="space-y-1.5">
              <li>
                <a href={sectionHref("#about")} className="hover:text-white transition-colors">
                  About Our Church
                </a>
              </li>
              <li>
                <a href={sectionHref("#services")} className="hover:text-white transition-colors">
                  Service Times &amp; Directions
                </a>
              </li>
              <li>
                <a href={sectionHref("#ministries")} className="hover:text-white transition-colors">
                  Ministries &amp; Fellowships
                </a>
              </li>
              <li>
                <a href={sectionHref("#watch")} className="hover:text-white transition-colors">
                  Sermons &amp; Messages
                </a>
              </li>
              <li>
                <Link to="/events" className="hover:text-white transition-colors">
                  Upcoming Events
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 mt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8BA9CE]">
          <div>
            &copy; Changed Life Baptist Church &middot; Since 1976 &middot; All Rights Reserved
          </div>
          <div className="flex items-center gap-4">
            <a href={sectionHref("#about")} className="hover:text-white transition-colors">
              Statement of Faith
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
