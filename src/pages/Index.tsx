import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Calendar,
  BarChart3,
  Heart,
  Shield,
  ArrowRight,
  Code,
  Globe,
  Zap,
  Compass,
  CheckCircle2,
  Sparkles,
  Radio,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import heroImage from "@/assets/hero-church.jpg";
import clbcLogo from "@/assets/clbc-logo.png";

const Index = () => {
  const navigate = useNavigate();

  const highlights = [
    {
      icon: Sparkles,
      label: "Built for Ministry",
      text: "Everything you need to shepherd well—without extra noise.",
    },
    {
      icon: ShieldCheck,
      label: "Data Peace of Mind",
      text: "Secure, private, and reliable so you can focus on people.",
    },
    {
      icon: Clock,
      label: "Hours Back Weekly",
      text: "Automations that return your time to discipleship and care.",
    },
  ];

  const features = [
    {
      icon: Users,
      title: "Member Care",
      description:
        "Keep families, milestones, and follow-ups organized so no one slips through the cracks.",
      badge: "Pastoral lens",
    },
    {
      icon: Calendar,
      title: "Attendance & Events",
      description:
        "Track services, teams, and gatherings with clear visibility into participation trends.",
      badge: "Automated logs",
    },
    {
      icon: BarChart3,
      title: "Health Dashboards",
      description:
        "See growth, engagement, and ministry momentum at a glance with ready-to-share reports.",
      badge: "Leadership-ready",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Ministry First",
      description: "Tools that amplify discipleship and community, not bureaucracy.",
    },
    {
      icon: Users,
      title: "People Over Profiles",
      description: "Every member story stays central, from visits to baptisms and beyond.",
    },
    {
      icon: Shield,
      title: "Guarded & Trusted",
      description: "Security-forward by default so leadership can steward with confidence.",
    },
  ];

  const steps = [
    {
      title: "1) Launch",
      text: "Import your members and attendance in minutes with guided setup.",
    },
    {
      title: "2) Lead",
      text: "Run services, teams, and follow-ups with clean, ministry-ready workflows.",
    },
    {
      title: "3) Learn",
      text: "Share clear insights with pastors and boards to fuel wise decisions.",
    },
  ];

  const stats = [
    { number: "9+", label: "Churches served" },
    { number: "1k+", label: "Members cared for" },
    { number: "99.9%", label: "Uptime reliability" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main>
        <section className="relative overflow-hidden pt-24 pb-28 md:pt-32 md:pb-36">
          <div className="absolute inset-0">
            <img src={heroImage} alt="Church community" className="h-full w-full object-cover object-top opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/10" />
          </div>

          <div className="relative z-10 container mx-auto px-4 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  <Zap className="h-4 w-4" />
                  Built for ministry teams who want time back
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                    Shepherd people, not spreadsheets.
                    <span className="block text-primary">We handle the admin.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                    CLBC Deliverance Centre keeps attendance, member care, and leadership reporting in one calm place. Less busywork, more discipleship.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="gap-2 px-8" onClick={() => navigate("/auth")}> 
                    Start now
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 px-8" onClick={() => navigate("/dashboard")}> 
                    See dashboard
                    <Compass className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 max-w-xl">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="rounded-xl border border-border/70 bg-background/70 p-4 shadow-sm">
                      <div className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="border-border/50 bg-background/70 backdrop-blur shadow-2xl shadow-primary/10">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Trust signals</p>
                      <p className="font-semibold">Fast onboarding. Secure by default.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {highlights.map((item, idx) => (
                      <div key={idx} className="flex gap-3 rounded-lg border border-border/60 bg-muted/40 p-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 flex items-start gap-3">
                    <Radio className="h-5 w-5 text-primary mt-1" />
                    <div className="space-y-1">
                      <p className="font-semibold">Go live this week.</p>
                      <p className="text-sm text-muted-foreground">Import members, set attendance, and share reports with leadership without new hire training.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
              <div className="space-y-2 max-w-2xl">
                <p className="text-sm font-semibold text-primary">What you get</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">A calm command center for ministry</h2>
                <p className="text-muted-foreground">Three pillars keep your church organized, secure, and connected.</p>
              </div>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/dashboard")}>Peek inside <ArrowRight className="h-4 w-4" /></Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <Card key={idx} className="group border-border/50 bg-background/80 backdrop-blur hover:-translate-y-1 hover:shadow-lg transition-all">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-primary/80 bg-primary/10 px-3 py-1 rounded-full">{feature.badge}</span>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-primary">How it works</p>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Launch, lead, and learn without chaos</h3>
              <p className="text-muted-foreground max-w-2xl">A simple three-step path to get your teams aligned and your data trustworthy.</p>

              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">{idx + 1}</div>
                    <div>
                      <p className="font-semibold text-foreground">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-border/50 bg-background/70 backdrop-blur shadow-xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Trusted rhythms</p>
                    <p className="font-semibold">Weekly attendance. Monthly reporting. Annual clarity.</p>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5" /> Guided onboarding and import support</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5" /> Role-based access for staff and volunteers</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5" /> Download-ready reports for leadership meetings</li>
                  <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5" /> Email and SMS-friendly member updates</li>
                </ul>

                <Button className="w-full" onClick={() => navigate("/auth")}>
                  Get started this week
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8 grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <Card className="border-border/50 bg-background/80 shadow-lg">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Heart className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Story from the field</p>
                    <p className="font-semibold">Lead pastors see more faces, not more forms.</p>
                  </div>
                </div>
                <p className="text-lg text-foreground">
                  “Within two Sundays we stopped chasing paper and started spotting who needed follow-up. Reports take minutes now, and our leaders spend that time visiting instead.”
                </p>
                <div className="text-sm text-muted-foreground">
                  Pastor, CLBC Deliverance Centre
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <p className="text-sm font-semibold text-primary">Why churches switch</p>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight">Stay organized without feeling corporate</h3>
              <p className="text-muted-foreground max-w-2xl">A modern system that still feels pastoral: gentle design, intentional flows, and privacy that respects your people.</p>

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                {values.map((value, idx) => (
                  <div key={idx} className="rounded-xl border border-border/60 bg-background/70 p-4 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <value.icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-foreground">{value.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <Card className="border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-background shadow-xl">
              <CardContent className="p-10 md:p-12 flex flex-col lg:flex-row gap-8 lg:items-center lg:justify-between">
                <div className="space-y-3 max-w-2xl">
                  <p className="text-sm font-semibold text-primary">Next step</p>
                  <h3 className="text-3xl font-bold">Ready to focus on changed lives?</h3>
                  <p className="text-muted-foreground">Join churches using CLBC Deliverance Centre to keep people first while staying organized.</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 border border-border/60"><Shield className="h-4 w-4 text-primary" /> Secure by design</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 border border-border/60"><Zap className="h-4 w-4 text-primary" /> Fast setup</span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 border border-border/60"><Globe className="h-4 w-4 text-primary" /> Works anywhere</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button size="lg" className="px-8" onClick={() => navigate("/auth")}>
                    Start free
                  </Button>
                  <Button size="lg" variant="outline" className="px-8" onClick={() => navigate("/dashboard")}>
                    View dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-background/60 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex items-center gap-3">
              <img src={clbcLogo} alt="C.L.B.C Logo" className="h-12 w-auto" />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold leading-tight tracking-tight">CLBC Deliverance Centre</span>
                <span className="text-sm text-muted-foreground leading-tight">Church Management System</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <a href="https://www.kimathi.tech/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 font-medium">
                <Code className="h-4 w-4 text-primary/70" />
                Developers
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 font-medium">
                <Globe className="h-4 w-4 text-primary/70" />
                Language
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Privacy Policy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Terms</a>
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
