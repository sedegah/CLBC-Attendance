import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Menu,
  X,
  LogOut,
  Home,
  LayoutDashboard,
  Shield,
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
  const { user, signOut } = useAuth();
  const { toast } = useToast();

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
      <header className="border-b border-[#E6E9EE] bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => navigate("/dashboard")}
            >
              <div className="h-10 w-10 rounded-full border border-[#0F3E6B]/20 bg-white shadow-sm p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img
                  src={clbcLogo}
                  alt="C.L.B.C Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base sm:text-lg font-bold text-[#0F3E6B] leading-tight">
                  C.L.B.C Church Management
                </span>
                <span className="text-[11px] text-slate-500 leading-tight">
                  Attendance &amp; Administrative System
                </span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F3E6B]/5 border border-[#0F3E6B]/15">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span className="text-xs font-semibold text-[#0F3E6B] truncate max-w-[140px]">
                    {(user as any)?.full_name || user.email?.split("@")[0]}
                  </span>
                </div>
              )}

              <ThemeToggle />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-1.5 text-xs font-semibold text-[#0F3E6B] hover:bg-[#0F3E6B]/10 rounded-xl"
                title="Back to Public Church Website"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Website</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-1.5 text-xs text-[#C62828] border-[#C62828]/30 hover:bg-[#C62828]/10 hover:text-[#C62828] rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
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
            <a
              href="#about"
              className="hover:text-[#C62828] transition-colors py-1"
            >
              About
            </a>
            <a
              href="#services"
              className="hover:text-[#C62828] transition-colors py-1"
            >
              Services
            </a>
            <a
              href="#ministries"
              className="hover:text-[#C62828] transition-colors py-1"
            >
              Ministries
            </a>
            <a
              href="#watch"
              className="hover:text-[#C62828] transition-colors py-1"
            >
              Sermons
            </a>
            <a
              href="#events"
              className="hover:text-[#C62828] transition-colors py-1"
            >
              Events
            </a>
            <a
              href="#contact"
              className="hover:text-[#C62828] transition-colors py-1"
            >
              Contact
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />

            {/* Portal / Dashboard link */}
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#0F3E6B]/10 text-[#0F3E6B] hover:bg-[#0F3E6B]/20 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#0F3E6B] hover:bg-slate-100 transition-colors"
                title="Management System Staff Portal"
              >
                <Shield className="w-3.5 h-3.5 text-[#1F6FB5]" />
                <span>Portal</span>
              </Link>
            )}

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

            <ThemeToggle />

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
              { label: "About", href: "#about" },
              { label: "Services & Times", href: "#services" },
              { label: "Ministries", href: "#ministries" },
              { label: "Sermons & Messages", href: "#watch" },
              { label: "Upcoming Events", href: "#events" },
              { label: "Contact & Location", href: "#contact" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-[#1B2430] hover:bg-[#F4F7FB] hover:text-[#C62828] transition-colors"
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}

            <div className="pt-3 border-t border-slate-100 px-3 space-y-2">
              <button
                onClick={handleGiveClick}
                className="w-full flex items-center justify-center gap-2 bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold py-3 rounded-xl shadow-md text-sm"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Give Online</span>
              </button>

              <Link
                to={user ? "/dashboard" : "/auth"}
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-[#0F3E6B] hover:bg-[#164C80] text-white font-semibold py-2.5 rounded-xl shadow-sm text-xs"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{user ? "Go to Admin Dashboard" : "Staff Portal Login"}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
