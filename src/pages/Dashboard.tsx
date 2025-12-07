import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  CalendarPlus, 
  MessageSquare, 
  FileText,
  Clock,
  MapPin,
  ArrowRight,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import clbcLogo from "@/assets/clbc-logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const memberStats = [
    {
      title: "Total Members",
      value: "1,247",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "New This Month",
      value: "23",
      change: "+8%",
      trend: "up",
      icon: UserPlus,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Avg. Attendance",
      value: "856",
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Monthly Giving",
      value: "$45,230",
      change: "+15%",
      trend: "up",
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  const upcomingEvents = [
    {
      title: "Sunday Worship Service",
      date: "This Sunday",
      time: "9:00 AM - 12:00 PM",
      location: "Main Sanctuary",
      attendees: 850,
    },
    {
      title: "Youth Bible Study",
      date: "Wednesday",
      time: "6:30 PM - 8:00 PM",
      location: "Youth Center",
      attendees: 45,
    },
    {
      title: "Women's Fellowship",
      date: "Friday",
      time: "10:00 AM - 12:00 PM",
      location: "Fellowship Hall",
      attendees: 60,
    },
    {
      title: "Community Outreach",
      date: "Saturday",
      time: "8:00 AM - 2:00 PM",
      location: "Downtown Center",
      attendees: 30,
    },
  ];

  const quickActions = [
    {
      title: "Add New Member",
      description: "Register a new church member",
      icon: UserPlus,
      color: "bg-primary hover:bg-primary-dark",
    },
    {
      title: "Schedule Event",
      description: "Create a new church event",
      icon: CalendarPlus,
      color: "bg-secondary hover:bg-secondary/90",
    },
    {
      title: "Send Announcement",
      description: "Notify members via SMS/Email",
      icon: MessageSquare,
      color: "bg-accent hover:bg-accent/90",
    },
    {
      title: "Generate Report",
      description: "View attendance & finance reports",
      icon: FileText,
      color: "bg-success hover:bg-success/90",
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={clbcLogo} alt="C.L.B.C Logo" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground leading-tight">C.L.B.C</span>
                <span className="text-xs text-muted-foreground leading-tight">Dashboard</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>Welcome,</span>
                <span className="font-medium text-foreground">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member'}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Overview of your church management</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {memberStats.map((stat, index) => (
            <Card key={index} className="border-border/60 hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-success" />
                      <span className="text-xs text-success font-medium">{stat.change}</span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Events */}
          <div className="lg:col-span-2">
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>Next 7 days schedule</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{event.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.date} • {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground shrink-0">
                      <Users className="h-4 w-4" />
                      <span>{event.attendees}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    className={`w-full justify-start gap-3 h-auto py-4 ${action.color} text-primary-foreground`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-background/20 flex items-center justify-center shrink-0">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">{action.title}</div>
                      <div className="text-xs opacity-90">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your church community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "New member registered", name: "Sarah Johnson", time: "2 hours ago" },
                { action: "Donation received", name: "$250 from Anonymous", time: "4 hours ago" },
                { action: "Event RSVP", name: "15 new RSVPs for Youth Bible Study", time: "Yesterday" },
                { action: "Volunteer sign-up", name: "Michael Chen joined Outreach Team", time: "Yesterday" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 py-2 border-b border-border/40 last:border-0">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
