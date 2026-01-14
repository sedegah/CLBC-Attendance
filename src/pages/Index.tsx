import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BarChart3, Heart, Shield, ArrowRight, Code, Globe, Zap, Compass } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import heroImage from "@/assets/hero-church.jpg";
import clbcLogo from "@/assets/clbc-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Users,
      title: "Member Database",
      description: "Securely store and manage member information, spiritual milestones, and ministry involvement.",
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      icon: Calendar,
      title: "Attendance & Events",
      description: "Track worship attendance and special programs with automated reporting and insights.",
      colorClass: "text-secondary",
      bgClass: "bg-secondary/10",
    },
    {
      icon: BarChart3,
      title: "Reports & Analytics",
      description: "Generate detailed reports on growth, finances, and engagement for informed decisions.",
      colorClass: "text-amber-500",
      bgClass: "bg-amber-500/10",
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
  // -----------------------------------------------------------
  // -----------------------------------------------------------

  return (
    <div className="min-h-screen bg-background"> 
      {/* Navigation */}
      <Navigation />

      <main>
        {/* Hero Section - UPDATED THEME EMPHASIS AND TEXT FIXES */}
        <section className="relative overflow-hidden pt-24 pb-32 md:pt-32 md:pb-48 bg-gradient-to-br from-background via-muted/50 to-secondary/10">
          <div className="absolute inset-0 z-0 opacity-15">
            <img
              src={heroImage}
              alt="Church community"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-background/50 dark:bg-background/80" /> 
          </div>
          
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              {/* Tagline - Bolding via span classes */}
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-primary/10 rounded-full text-sm font-semibold text-primary border border-primary/20 shadow-md transform hover:scale-[1.03] transition-transform duration-300">
                <Zap className="h-4 w-4 fill-primary/20 text-primary" />
                <span className="font-extrabold">Simplify</span> Church Admin. <span className="font-extrabold">Magnify</span> Your Ministry.
              </div>
              
              {/* Headline - Theme Emphasized */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight tracking-tight drop-shadow-lg">
                The Platform for Every Ministry Focused on
                <span className="block text-primary mt-3">A Changed Life for Christ</span>
              </h1>
              
              {/* Body Copy - Theme Emphasized */}
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Reclaim time by streamlining operations, so your leaders can focus entirely on <span className="font-bold text-foreground">discipleship</span> and seeing <span className="font-bold text-foreground">changed lives</span> for the glory of Christ.
              </p>
              
              {/* CTA Buttons - Clear Primary and Secondary */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-7 gap-2 shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all font-bold group"
                  onClick={() => navigate("/auth")}
                >
                  Start Your Free Trial
                  <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="text-lg px-10 py-7 gap-2 border-2 border-primary/50 text-primary hover:bg-primary/10 font-semibold shadow-md"
                >
                  <Compass className="h-6 w-6 fill-current text-primary" /> 
                  Explore Features
                </Button>
              </div>
              
              {/* Stats - Integrated more smoothly */}
              <div className="grid grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="p-4 rounded-lg bg-background/50 backdrop-blur-sm border border-border/60 shadow-lg">
                    <div className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">{stat.number}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-background/70 backdrop-blur-md">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Core Tools for Focused Ministry
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Your simplified toolkit for managing records, events, and ministry growth.
              </p>
            </div>
            
            {/* Grid updated to handle 3 columns */}
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 overflow-hidden group"
                >
                  <CardHeader className="pb-4">
                    <div className={`h-14 w-14 rounded-xl ${feature.bgClass} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}>
                      <feature.icon className={`h-7 w-7 ${feature.colorClass}`} />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section id="values" className="py-24">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Our Foundational Values
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Built on principles that empower your mission and protect your community.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {values.map((value, index) => (
                <div key={index} className="text-center space-y-4 p-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto border-2 border-primary/30 shadow-lg shadow-primary/10">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className="py-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
          <div className="container mx-auto px-4 lg:px-8">
            <Card className="max-w-5xl mx-auto border-border/40 shadow-2xl shadow-primary/5">
              <CardContent className="p-12 md:p-16 text-center space-y-8">
                <h2 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
                  Ready to Focus on A Changed Life for Christ?
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Join churches across the nation using CLBC Deliverance Centre to serve their communities better.
                </p>
                <Button 
                  size="lg" 
                  className="text-lg px-10 py-7 font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/40 transition-shadow"
                  onClick={() => navigate("/auth")}
                >
                  Start Your Free Trial Today
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Logo Group - UPDATED */}
            <div className="flex items-center gap-3">
              <img src={clbcLogo} alt="C.L.B.C Logo" className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-foreground leading-tight tracking-tight">CLBC Deliverance Centre</span>
                <span className="text-sm text-muted-foreground leading-tight">Church Management System</span>
              </div>
            </div>
            
            {/* Links and Socials */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <a href="https://www.kimathi.tech/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 font-medium">
                <Code className="h-4 w-4 text-primary/70" />
                Developers
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 font-medium">
                <Globe className="h-4 w-4 text-primary/70" />
                Language
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
                Terms
              </a>
              {/* Twitter Icon */}
              <a 
                href="#" 
                className="text-muted-foreground hover:text-blue-400 transition-colors"
                aria-label="Follow us on Twitter"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.85.38-1.78.64-2.75.76 1-.6 1.76-1.55 2.12-2.68-.93.55-1.96.96-3.06 1.17-.88-.94-2.13-1.52-3.51-1.52-2.66 0-4.82 2.16-4.82 4.82 0 .38.04.75.13 1.10-4-.2-7.55-2.12-9.92-5.04-.42.72-.66 1.55-.66 2.44 0 1.67.85 3.15 2.14 4.01-.79-.03-1.53-.24-2.18-.6v.06c0 2.34 1.66 4.29 3.87 4.73-.40.11-.83.17-1.27.17-.31 0-.61-.03-.91-.08.61 1.92 2.39 3.31 4.49 3.35-1.65 1.29-3.73 2.06-5.99 2.06-.39 0-.77-.02-1.15-.07 2.13 1.37 4.66 2.17 7.38 2.17 8.85 0 13.69-7.33 13.69-13.69 0-.21 0-.42-.02-.62.94-.68 1.76-1.53 2.41-2.50z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground mt-10 border-t border-border/30 pt-6">
            © <span className="font-bold">{new Date().getFullYear()}</span> Changed Life Baptist Church. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
