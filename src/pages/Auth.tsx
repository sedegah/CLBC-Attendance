import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { WorshipArchSvg } from "@/components/church/WorshipArchSvg";
import clbcLogo from "@/assets/clbc-logo.png";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" }).max(100);
const nameSchema = z.string().trim().min(1, { message: "Full name is required" }).max(100);

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);

      if (isSignUp) {
        nameSchema.parse(fullName);
        const { error } = await signUp(email, password, fullName);

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome!",
            description: "Your account has been created successfully.",
          });
          navigate("/dashboard");
        }
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          toast({
            title: "Sign in failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "Signed in successfully.",
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC] overflow-x-hidden">
      {/* ================= LEFT SIDE: DEEP NAVY BRAND PANEL ================= */}
      <div className="w-full lg:w-[46%] xl:w-[44%] lg:h-full bg-[#0F3E6B] text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden flex-shrink-0">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 -left-16 w-80 h-80 rounded-full bg-[#1F6FB5]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-64 h-64 rounded-full bg-[#082A4B]/40 blur-2xl pointer-events-none" />

        {/* Top Brand Lockup */}
        <div className="relative z-10 flex items-center gap-3.5">
          <img
            src={clbcLogo}
            alt="Changed Life Baptist Church"
            className="w-11 h-11 sm:w-12 sm:h-12 object-contain flex-shrink-0"
          />
          <div className="font-serif font-bold text-lg sm:text-xl leading-[1.1] text-white">
            Changed Life<br />
            <span>Baptist Church</span>
          </div>
        </div>

        {/* Center Artwork & Titles */}
        <div className="my-10 sm:my-14 lg:my-auto text-center relative z-10 flex flex-col items-center">
          {/* Worship Arch Artwork */}
          <div className="mb-6 sm:mb-8 transform hover:scale-[1.02] transition-transform duration-300">
            <WorshipArchSvg
              navy="#0F3E6B"
              blue="#1F6FB5"
              className="w-[200px] xs:w-[230px] sm:w-[260px] md:w-[280px] h-auto drop-shadow-2xl mx-auto"
            />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-[34px] font-bold text-white tracking-tight leading-snug max-w-sm">
            Management and attendance portal
          </h2>

          <p className="font-serif text-sm sm:text-base text-white/80 mt-2 font-normal">
            A Changed Life For Christ
          </p>
        </div>

        {/* Bottom Tagline */}
        <div className="relative z-10 text-xs text-white/60 font-medium">
          Serving Christ since 1976
        </div>
      </div>

      {/* ================= RIGHT SIDE: AUTHENTICATION FORM ================= */}
      <div className="flex-1 lg:h-full bg-[#F8FAFC] flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative overflow-y-auto">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between w-full max-w-lg mx-auto lg:max-w-none">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0F3E6B] bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs px-4 py-2 rounded-full transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to church website</span>
          </Link>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8 sm:py-12">
          {/* Heading and Subtitle */}
          <div className="space-y-2 mb-8">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F3E6B] tracking-tight">
              {isSignUp ? "Create account" : "Sign in"}
            </h1>
            <p className="text-sm sm:text-base text-[#4A5565] leading-relaxed">
              {isSignUp
                ? "Register your administrative account to manage church records."
                : "Use your portal account to record attendance and look after members."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="space-y-1.5">
                <Label htmlFor="auth-fullname" className="text-xs sm:text-sm font-semibold text-slate-800">
                  Full name
                </Label>
                <Input
                  id="auth-fullname"
                  type="text"
                  placeholder="e.g. Samuel Mensah"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  maxLength={100}
                  className="h-12 bg-white rounded-xl border-slate-200 text-sm focus-visible:ring-[#0F3E6B]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="auth-email" className="text-xs sm:text-sm font-semibold text-slate-800">
                Email address
              </Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
                className="h-12 bg-white rounded-xl border-slate-200 text-sm focus-visible:ring-[#0F3E6B]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="auth-password" className="text-xs sm:text-sm font-semibold text-slate-800">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  maxLength={100}
                  className="h-12 bg-white rounded-xl border-slate-200 text-sm pr-16 focus-visible:ring-[#0F3E6B]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#1F6FB5] hover:text-[#0F3E6B] transition-colors px-1"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#C62828] hover:bg-[#B71C1C] active:scale-[0.99] text-white font-semibold text-sm sm:text-base py-3.5 h-12 rounded-full shadow-md shadow-[#C62828]/25 hover:shadow-lg transition-all mt-2 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : isSignUp ? (
                <span>Register account</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign in to portal</span>
                </>
              )}
            </Button>

            {/* Toggle Sign in / Sign up link */}
            <div className="text-center pt-2 text-xs sm:text-sm text-slate-600">
              {isSignUp ? (
                <span>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="font-semibold text-[#1F6FB5] hover:text-[#0F3E6B] underline ml-1"
                  >
                    Sign in here
                  </button>
                </span>
              ) : (
                <span>
                  Need administrative access?{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="font-semibold text-[#1F6FB5] hover:text-[#0F3E6B] underline ml-1"
                  >
                    Register account
                  </button>
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-center text-[11px] sm:text-xs text-slate-400 py-2">
          Changed Life Baptist Church &middot; Management and attendance portal
        </div>
      </div>
    </div>
  );
};

export default Auth;
