import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, MessageSquare, UserCheck, BarChart3, Heart, Shield } from "lucide-react";
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
      icon: Heart,
      title: "Community Focused",
      description: "Strengthen relationships and ensure every member feels valued and connected.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is protected with industry-leading security and privacy standards.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={clbcLogo} alt="C.L.B.C Logo" className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">C.L.B.C</span>
                <span className="text-xs text-muted-foreground">Church Management</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost">Features</Button>
              <Button variant="ghost">About</Button>
              <Button variant="default">Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
                  A Changed Life For Christ - Since 1970
                </span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Changed Life Baptist Church{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Management System
                </span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                An all-in-one digital platform designed to simplify operations at Changed Life Baptist Church (C.L.B.C). 
                Strengthen connections and help our ministry grow. Focus more on people, less on paperwork.
              </p>
              <div className="flex gap-4">
                <Button size="lg" variant="hero" className="shadow-glow">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline">
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-foreground">9+</div>
                  <div className="text-sm text-muted-foreground">Churches</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-foreground">1000+</div>
                  <div className="text-sm text-muted-foreground">Members</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-foreground">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-3xl blur-3xl" />
              <img 
                src={heroImage} 
                alt="Church community connecting together" 
                className="relative rounded-3xl shadow-2xl w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Everything Your Church Needs
            </h2>
            <p className="text-xl text-muted-foreground">
              Comprehensive tools designed specifically for modern church management and community building.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg hover:border-primary/30 transition-smooth bg-card group">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-smooth">
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
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6">
              Why It Matters
            </h2>
            <p className="text-xl text-muted-foreground">
              Move from manual records to a unified, data-driven approach that saves time, 
              improves transparency, and strengthens your ability to serve.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto">
                  <value.icon className="h-8 w-8 text-secondary" />
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
      <section className="py-20 lg:py-32 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/95" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground space-y-6">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Our Vision
            </h2>
            <p className="text-xl lg:text-2xl leading-relaxed opacity-95">
              To use technology as a tool for ministry — making church management simpler, 
              relationships stronger, and outreach broader.
            </p>
            <p className="text-lg opacity-90">
              Every member feels seen, supported, and spiritually connected.
            </p>
              <div className="pt-8">
              <Button size="lg" variant="accent" className="shadow-xl">
                Join Our Mission
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <Card className="border-primary/20 shadow-xl">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Ready to Transform Your Church Management?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of churches using smart technology to focus on what matters most — people and ministry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" variant="hero">
                  Get Started Free
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
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={clbcLogo} alt="C.L.B.C Logo" className="h-10 w-auto" />
                <div className="flex flex-col">
                  <span className="text-base font-bold">C.L.B.C</span>
                  <span className="text-xs text-muted-foreground">Church Management</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Changed Life Baptist Church - A Changed Life For Christ since 1970.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
              </ul>
            </div>
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
