import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Shield, Lock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
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
      // Validate inputs
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
            description: "You have successfully signed in.",
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
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col justify-between p-4 sm:p-6 relative">
      {/* Top bar controls */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0F3E6B] hover:text-[#C62828] bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Church Website</span>
        </Link>

        <ThemeToggle />
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <Card className="border border-[#E6E9EE] shadow-xl rounded-2xl overflow-hidden bg-white">
          {/* Card Top Banner */}
          <div className="bg-[#0F3E6B] text-white p-6 sm:p-7 text-center relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            
            <div className="mx-auto w-16 h-16 rounded-full bg-white p-1.5 shadow-md flex items-center justify-center mb-3">
              <img
                src={clbcLogo}
                alt="CLBC Logo"
                className="w-12 h-12 object-contain"
              />
            </div>

            <CardTitle className="font-serif text-xl sm:text-2xl font-bold text-white tracking-normal">
              Changed Life Baptist Church
            </CardTitle>
            <CardDescription className="text-[#BCD6F2] text-xs sm:text-sm mt-1">
              {isSignUp ? "Create Staff Account" : "Management & Attendance Portal"}
            </CardDescription>
          </div>

          <CardContent className="p-6 sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="e.g. Pastor Samuel Mensah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    maxLength={100}
                    className="h-10 text-sm"
                  />
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@changedlifebaptist.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  className="h-10 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={100}
                    className="h-10 text-sm pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 flex items-center justify-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#0F3E6B] hover:bg-[#164C80] active:scale-[0.99] text-white font-semibold py-2.5 rounded-xl shadow-md h-11 text-sm mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Please wait..."
                ) : isSignUp ? (
                  "Create Account"
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Sign In to Portal
                  </span>
                )}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs font-semibold text-[#1F6FB5] hover:text-[#0F3E6B] hover:underline"
                >
                  {isSignUp
                    ? "Already have an account? Sign in here"
                    : "Need administrative access? Register account"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-xs text-slate-400 py-2">
        Changed Life Baptist Church &middot; Serving Christ Since 1976
      </div>
    </div>
  );
};

export default Auth;
