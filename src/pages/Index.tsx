import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, MessageSquare, UserCheck, BarChart3, Heart, Shield, ArrowRight, Play, CheckCircle, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-church.jpg";
import clbcLogo from "@/assets/clbc-logo.png";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  const features = [
    {
      icon: Users,
      title: "Member Database",
      description: "Securely store and manage member information, spiritual milestones, and ministry involvement.",
    },
    {
      icon: Calendar,
      title: "Attendance & Events",
      description: "Track worship attendance and special programs with automated reporting and insights.",
    },
    {
      icon: DollarSign,
      title: "Donation Management",
      description: "Record tithes, offerings, and pledges with auto-generated receipts and financial summaries.",
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description: "Send announcements and reminders via SMS, email, or in-app notifications.",
    },
    {
      icon: UserCheck,
      title: "Volunteer Coordination",
      description: "Assign and manage ministry roles and service teams with ease and accountability.",
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Generate detailed reports on growth, finances, and engagement for informed decisions.",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Ministry First",
      description: "Technology designed to enhance ministry, not replace human connection.",
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Strengthen relationships and ensure every member feels valued and connected.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with industry-leading security and privacy standards.",
    },
  ];

  const stats = [
    { number: "9+", label: "Churches" },
    { number: "1000+", label: "Members" },
    { number: "99.9%", label: "Uptime" },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/20 to-purple-50/10">
      {/* Navigation */}
      <nav className="border-b border-border/60 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={clbcLogo} alt="C.L.B.C Logo" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">C.L.B.C</span>
                <span className="text-xs text-muted-foreground leading-tight">Church Management</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Features
              </a>
              <a href="#testimonials" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Testimonials
              </a>
              <a href="#pricing" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Pricing
              </a>
              
              {!loading && (
                user ? (
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    className="gap-2"
                    onClick={() => navigate("/auth")}
                  >
                    Sign In
                  </Button>
                )
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3 border-t border-border/60">
              <a
                href="#features"
                className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#testimonials"
                className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </a>
              <a
                href="#pricing"
                className="block text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              
              {!loading && (
                user ? (
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Sign In
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5" />
          <img
            src={heroImage}
            alt="Church community"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary">
              <CheckCircle className="h-4 w-4" />
              Trusted by {stats[1].number} members across {stats[0].number} churches
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
              Changed Life Baptist Church
              <span className="block text-primary mt-2">Management System</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A Changed Life For Christ - Since 1970
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="text-base px-8 gap-2 shadow-lg hover:shadow-primary/20 transition-all"
                onClick={() => navigate("/auth")}
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 gap-2">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Everything You Need to Manage Your Church
            </h2>
            <p className="text-lg text-muted-foreground">
              Streamline operations, strengthen community, and focus on what matters most—ministry.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/60 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Built on Values That Matter
            </h2>
            <p className="text-lg text-muted-foreground">
              Our platform is designed with your church's mission at the heart of everything we do.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-blue-500/10 to-purple-500/10">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto border-border/60">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Ready to Transform Your Church Management?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join churches across the nation using C.L.B.C Manager to serve their communities better.
              </p>
              <Button 
                size="lg" 
                className="text-base px-8"
                onClick={() => navigate("/auth")}
              >
                Start Your Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background/50 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={clbcLogo} alt="C.L.B.C Logo" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">C.L.B.C</span>
                <span className="text-xs text-muted-foreground leading-tight">Changed Life Baptist Church</span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.85.38-1.78.64-2.75.76 1-.6 1.76-1.55 2.12-2.68-.93.55-1.96.96-3.06 1.17-.88-.94-2.13-1.52-3.51-1.52-2.66 0-4.82 2.16-4.82 4.82 0 .38.04.75.13 1.10-4-.2-7.55-2.12-9.92-5.04-.42.72-.66 1.55-.66 2.44 0 1.67.85 3.15 2.14 4.01-.79-.03-1.53-.24-2.18-.6v.06c0 2.34 1.66 4.29 3.87 4.73-.40.11-.83.17-1.27.17-.31 0-.61-.03-.91-.08.61 1.92 2.39 3.31 4.49 3.35-1.65 1.29-3.73 2.06-5.99 2.06-.39 0-.77-.02-1.15-.07 2.13 1.37 4.66 2.17 7.38 2.17 8.85 0 13.69-7.33 13.69-13.69 0-.21 0-.42-.02-.62.94-.68 1.76-1.53 2.41-2.50z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground mt-8">
            © {new Date().getFullYear()} Changed Life Baptist Church. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
