import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Calendar, DollarSign, MessageSquare, UserCheck, BarChart3, Heart, Shield, ArrowRight, Play, CheckCircle, Menu, X, Phone, LogIn, Eye, EyeOff, Church } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-church.jpg";
import clbcLogo from "@/assets/clbc-logo.png";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("home"); // "home" or "login"
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempted");
  };

  // Login Page Component
  if (currentPage === "login") {
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

              <Button 
                variant="ghost" 
                className="gap-2"
                onClick={() => setCurrentPage("home")}
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Home
              </Button>
            </div>
          </div>
        </nav>

        {/* Login Section */}
        <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              {/* Login Form */}
              <div className="flex justify-center">
                <Card className="w-full max-w-md border-border/50 shadow-2xl">
                  <CardHeader className="text-center space-y-2">
                    <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Church className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>
                      Sign in to your C.L.B.C Management System account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your church email"
                          className="w-full"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="w-full pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="remember"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          />
                          <Label htmlFor="remember" className="text-sm font-normal">
                            Remember me
                          </Label>
                        </div>
                        <Button variant="link" className="px-0 text-sm">
                          Forgot password?
                        </Button>
                      </div>

                      <Button type="submit" className="w-full gap-2" size="lg">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </Button>
                    </form>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">
                          New to C.L.B.C?
                        </span>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full" size="lg">
                      Contact Admin for Access
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Login Side Content */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
                    <CheckCircle className="h-4 w-4" />
                    Secure Church Portal
                  </div>
                  
                  <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                    C.L.B.C Member{" "}
                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Portal
                    </span>
                  </h2>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Access your church management dashboard, connect with ministry teams, 
                    and stay updated with church activities all in one secure platform.
                  </p>
                </div>

                <div className="grid gap-4">
                  {[
                    { icon: ShieldCheck, text: "End-to-end encryption" },
                    { icon: Users, text: "Role-based access control" },
                    { icon: Calendar, text: "Real-time updates" },
                    { icon: MessageSquare, text: "Secure messaging" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-muted/30 rounded-lg border border-border">
                  <h3 className="font-semibold mb-2">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contact the church administration team for account assistance or to request access.
                  </p>
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Home Page
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation */}
      <nav className="border-b border-border/60 bg-background/95 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <img src={clbcLogo} alt="C.L.B.C Logo" className="h-10 w-auto transition-transform group-hover:scale-105" />
                <div className="absolute -inset-1 bg-primary/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">C.L.B.C</span>
                <span className="text-xs text-muted-foreground leading-tight">Church Management</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <Button
                variant="ghost"
                className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 group"
                onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Features
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-4/5 group-hover:left-1/10" />
              </Button>
              <Button
                variant="ghost"
                className="relative px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 group"
                onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
              >
                About
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-4/5 group-hover:left-1/10" />
              </Button>
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" className="gap-2 text-foreground/80 hover:text-foreground">
                <Phone className="h-4 w-4" />
                Contact
              </Button>
              <Button 
                variant="default" 
                className="gap-2 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                onClick={() => setCurrentPage("login")}
              >
                <LogIn className="h-4 w-4" />
                Login
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 text-base font-medium text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                  onClick={() => {
                    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMenuOpen(false);
                  }}
                >
                  Features
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 text-base font-medium text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                  onClick={() => {
                    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMenuOpen(false);
                  }}
                >
                  About
                </Button>
                <div className="pt-2 border-t border-border/60">
                  <Button 
                    className="w-full justify-center gap-2 mt-2"
                    onClick={() => setCurrentPage("login")}
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background to-muted/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20">
                <CheckCircle className="h-4 w-4" />
                A Changed Life For Christ - Since 1970
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  Changed Life Baptist Church{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Management System
                  </span>
                </h1>
                <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                  An all-in-one digital platform designed to simplify operations at Changed Life Baptist Church. 
                  Strengthen connections and help our ministry grow. Focus more on people, less on paperwork.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  variant="hero" 
                  className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
                  onClick={() => setCurrentPage("login")}
                >
                  <LogIn className="h-4 w-4" />
                  Member Login
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <Play className="h-4 w-4" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-foreground">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-xl opacity-50" />
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                <img 
                  src={heroImage} 
                  alt="Church community connecting together" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything Your Church Needs
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools designed specifically for modern church management and community building.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 group hover:-translate-y-1"
              >
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section id="about" className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Built on Faith, Powered by Purpose
            </h2>
            <p className="text-lg text-muted-foreground">
              Move from manual records to a unified, data-driven approach that saves time, 
              improves transparency, and strengthens your ability to serve.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="text-center space-y-4 p-6 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 bg-noise-pattern opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Our Vision for Ministry
            </h2>
            <p className="text-xl lg:text-2xl leading-relaxed opacity-95 font-light">
              To use technology as a tool for ministry — making church management simpler, 
              relationships stronger, and outreach broader.
            </p>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Every member feels seen, supported, and spiritually connected through our dedicated platform.
            </p>
            <div className="pt-8">
              <Button 
                size="lg" 
                variant="secondary" 
                className="shadow-xl gap-2"
                onClick={() => setCurrentPage("login")}
              >
                <LogIn className="h-4 w-4" />
                Access Member Portal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 shadow-2xl overflow-hidden">
            <CardContent className="p-12 text-center space-y-6 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-primary rounded-full" />
              <h2 className="text-3xl lg:text-4xl font-bold pt-4">
                Ready to Access Your Account?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our church community in managing ministries, events, and connections through our secure portal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg" 
                  variant="hero" 
                  className="gap-2"
                  onClick={() => setCurrentPage("login")}
                >
                  <LogIn className="h-4 w-4" />
                  Member Login
                </Button>
                <Button size="lg" variant="outline">
                  Request Access
                </Button>
              </div>
              <p className="text-sm text-muted-foreground pt-4">
                Secure • Private • Church Members Only
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={clbcLogo} alt="C.L.B.C Logo" className="h-8 w-auto" />
                <div className="flex flex-col">
                  <span className="text-base font-bold">C.L.B.C</span>
                  <span className="text-xs text-muted-foreground">Church Management</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Changed Life Baptist Church - A Changed Life For Christ since 1970.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Security", "Testimonials"]
              },
              {
                title: "Resources",
                links: ["Documentation", "Support", "Guides"]
              },
              {
                title: "Church",
                links: ["About Us", "Contact", "Privacy", "Terms"]
              }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Changed Life Baptist Church. All rights reserved. Built with ❤️ for ministry.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
