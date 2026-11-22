import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Menu,
  X,
  LogOut,
  Bell,
  Heart,
  ChevronRight,
} from "lucide-react";
import clbcLogo from "@/assets/clbc-logo.png";

interface NavigationProps {
  variant?: "default" | "dashboard";
  onGiveOnline?: () => void;
}

export const Navigation = ({ variant = "default", onGiveOnline }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const isHome = location.pathname === "/";
  const sectionHref = (hash: string) => (isHome ? hash : `/${hash}`);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  const handleGiveClick = () => {
    setIsMenuOpen(false);
    if (onGiveOnline) {
      onGiveOnline();
    } else {
      const giveElem = document.getElementById("give");
      if (giveElem) {
        giveElem.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/#give");
      }
    }
  };

  // Dashboard Header Variant
  if (variant === "dashboard") {
    return (
      <header className="sticky top-0 z-50 border-b border-[#E6E9EE] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            type="button"
            className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
            onClick={() => navigate("/dashboard")}
          >
            <img
              src={clbcLogo}
              alt="C.L.B.C Logo"
              className="h-9 w-9 flex-shrink-0 object-contain sm:h-10 sm:w-10"
            />
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-base font-bold text-[#0F3E6B] sm:text-lg">
                C.L.B.C
              </span>
              <span className="text-[10px] font-medium tracking-wide text-slate-500 sm:text-[11px]">
                Church Management
              </span>
            </span>
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() =>
                toast({
                  title: "Notifications",
                  description: "You're all caught up. No new notifications.",
                })
              }
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#0F3E6B]"
            >
              <Bell className="h-[18px] w-[18px]" />
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#C62828] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#B71C1C] sm:px-4 sm:text-sm"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Public Church Website Navigation (Matching Mockup)
  return (
    <nav className="bg-white border-b border-[#E6E9EE] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Brand lockup matching mockup */}
          <Link
            to="/"
            className="flex items-center gap-3.5 hover:opacity-95 transition-opacity flex-shrink-0"
          >
            <img
              src={clbcLogo}
              alt="Changed Life Baptist Church logo"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain"
            />
            <span className="font-serif font-bold text-lg sm:text-[22px] leading-[1.1] text-[#0F3E6B]">
              Changed Life<br />
              <span className="font-serif">Baptist Church</span>
            </span>
          </Link>

          {/* Desktop Navigation Links matching mockup */}
          <div className="hidden lg:flex items-center gap-7 xl:gap-8 font-medium text-[15px] text-[#1B2430]">
            {[
              { label: "About", hash: "#about" },
              { label: "Services", hash: "#services" },
              { label: "Ministries", hash: "#ministries" },
              { label: "Sermons", hash: "#watch" },
            ].map((link) => (
              <a
                key={link.hash}
                href={sectionHref(link.hash)}
                className="hover:text-[#C62828] transition-colors py-1"
              >
                {link.label}
              </a>
            ))}
            <Link
              to="/events"
              className={`hover:text-[#C62828] transition-colors py-1 ${
                location.pathname === "/events" ? "text-[#C62828]" : ""
              }`}
            >
              Events
            </Link>
            <Link
              to="/visit"
              className={`hover:text-[#C62828] transition-colors py-1 ${
                location.pathname === "/visit" ? "text-[#C62828]" : ""
              }`}
            >
              Visit
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Give Online button matching mockup */}
            <button
              onClick={handleGiveClick}
              className="inline-flex items-center justify-center gap-1.5 bg-[#C62828] hover:bg-[#B71C1C] active:scale-[0.98] text-white font-semibold text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer min-h-[44px]"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Give Online</span>
            </button>
          </div>

          {/* Mobile Actions & Menu Toggle matching mobile mockup */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={handleGiveClick}
              className="bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold text-xs px-3.5 py-2 rounded-full shadow-sm"
            >
              Give
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-11 h-11 border border-[#D5DBE5] bg-white rounded-xl flex items-center justify-center text-[#0F3E6B] hover:bg-slate-50 transition-colors"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 stroke-[2]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[2]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-[#E6E9EE] bg-white py-4 px-2 space-y-1 shadow-xl animate-in slide-in-from-top-2 duration-200">
            {[
              { label: "About", href: sectionHref("#about") },
              { label: "Services & Times", href: sectionHref("#services") },
              { label: "Ministries", href: sectionHref("#ministries") },
              { label: "Sermons & Messages", href: sectionHref("#watch") },
              { label: "Upcoming Events", href: "/events" },
              { label: "Visit & Location", href: "/visit" },
            ].map((link) =>
              link.href.startsWith("/") && !link.href.startsWith("/#") ? (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#F4F7FB] hover:text-[#C62828] transition-colors ${
                    location.pathname === link.href ? "text-[#C62828]" : "text-[#1B2430]"
                  }`}
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-[#1B2430] hover:bg-[#F4F7FB] hover:text-[#C62828] transition-colors"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </a>
              ),
            )}

            <div className="pt-3 border-t border-slate-100 px-3">
              <button
                onClick={handleGiveClick}
                className="w-full flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold py-3 rounded-xl shadow-md text-sm"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Give Online</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
