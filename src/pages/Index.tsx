import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, MessageSquare, UserCheck, BarChart3, Heart, Shield, ArrowRight, Play, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-church.jpg";
import clbcLogo from "@/assets/clbc-logo.png";

const Index = () => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={clbcLogo} alt="C.L.B.C Logo" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">C.L.B.C</span>
                <span className="text-xs text-muted-foreground">Church Management</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="hidden sm:flex">Features</Button>
              <Button variant="ghost" className="hidden sm:flex">About</Button>
              <Button variant="default" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
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
                <Button size="lg" variant="hero" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
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
      <section className="py-20 lg:py-28">
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
              <Button size="lg" variant="secondary" className="shadow-xl gap-2">
                Join Our Mission <ArrowRight className="h-4 w-4" />
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
                Ready to Transform Your Church Management?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of churches using smart technology to focus on what matters most — people and ministry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" variant="hero" className="gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Schedule a Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground pt-4">
                No credit card required • Free 30-day trial • Cancel anytime
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
                links: ["Features", "Pricing", "Security", "Testimonials"]
              },
              {
                title: "Resources",
                links: ["Documentation", "Support", "Blog", "Guides"]
              },
              {
                title: "Company",
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
