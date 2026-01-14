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
  Image as ImageIcon,
  ChevronDown,
} from "lucide-react";
import clbcLogo from "@/assets/clbc-logo.png";
import { cn } from "@/lib/utils";

interface NavigationProps {
  variant?: "default" | "dashboard";
}

export const Navigation = ({ variant = "default" }: NavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const NavItem = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon?: any }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg",
          active
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-foreground/70 hover:text-foreground hover:bg-accent"
        )}
        onClick={() => setIsMenuOpen(false)}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </Link>
    );
  };

  const MobileNavItem = ({ to, children, icon: Icon }: { to: string; children: React.ReactNode; icon?: any }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-3 px-4 py-3 text-base font-medium transition-all rounded-lg",
          active
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-foreground/70 hover:text-foreground hover:bg-accent"
        )}
        onClick={() => setIsMenuOpen(false)}
      >
        {Icon && <Icon className="h-5 w-5" />}
        {children}
      </Link>
    );
  };

  if (variant === "dashboard") {
    return (
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <img src={clbcLogo} alt="C.L.B.C Logo" className="h-10 w-auto" />
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-extrabold text-foreground leading-tight tracking-tight">
                  C.L.B.C
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  Church Management
                </span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-border/60">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">
                    {user.email?.split("@")[0]}
                  </span>
                </div>
              )}
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <Home className="h-5 w-5" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
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

  return (
    <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="relative">
              <img
                src={clbcLogo}
                alt="C.L.B.C Logo"
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-foreground leading-tight tracking-tight">
                CLBC Deliverance Centre
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                Church Management System
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <NavItem to="/" icon={Home}>
              Home
            </NavItem>
            <NavItem to="/gallery" icon={ImageIcon}>
              Gallery
            </NavItem>
            {user && (
              <NavItem to="/dashboard" icon={LayoutDashboard}>
                Dashboard
              </NavItem>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {!loading && (
              user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border/60">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-foreground">
                      {user.email?.split("@")[0]}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => navigate("/auth")}
                  className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
                >
                  Get Started Free
                  <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
                </Button>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 space-y-2 border-t border-border/60 animate-in slide-in-from-top-2 duration-200">
            <MobileNavItem to="/" icon={Home}>
              Home
            </MobileNavItem>
            <MobileNavItem to="/gallery" icon={ImageIcon}>
              Gallery
            </MobileNavItem>
            {user && (
              <MobileNavItem to="/dashboard" icon={LayoutDashboard}>
                Dashboard
              </MobileNavItem>
            )}

            <div className="h-px bg-border/60 my-4" />

            {!loading && (
              user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/50 border border-border/60">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-foreground">
                      {user.email?.split("@")[0]}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate("/auth");
                    setIsMenuOpen(false);
                  }}
                >
                  Get Started Free
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
