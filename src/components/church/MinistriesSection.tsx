import { useState } from "react";
import { Users, Sparkles, Music, Heart, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const MinistriesSection = () => {
  const [activeMinistry, setActiveMinistry] = useState<any | null>(null);

  const ministries = [
    {
      id: "children",
      title: "Children's Ministry",
      subtitle: "Kingdom Kids",
      color: "#1F6FB5",
      badge: "Nursery to 12 Years",
      schedule: "Sundays at 8:00 AM & 10:30 AM",
      shortDesc: "A safe, fun, and scripture-filled environment where children encounter God's love through interactive lessons, songs, and memory verses.",
      fullDesc: "Kingdom Kids is committed to partnering with parents to build solid spiritual foundations in young lives. Every child is guided by trained, background-checked teachers who make God's Word come alive through age-appropriate curricula, engaging crafts, and joyful worship.",
      features: ["Safe & secure check-in system", "Age-graded classrooms", "Passionate, vetted teachers", "Annual Vacation Bible School"],
    },
    {
      id: "youth",
      title: "Youth Ministry",
      subtitle: "Crossroads Youth",
      color: "#C62828",
      badge: "Teens & High School",
      schedule: "Saturdays at 4:30 PM & Sundays",
      shortDesc: "Equipping teenagers to stand bold in Christ, navigate real-world questions, and build lasting, faith-filled friendships.",
      fullDesc: "Crossroads Youth brings teenagers together in an energetic atmosphere where they can ask honest questions, discover their God-given gifts, and grow in authentic discipleship. Our gatherings feature dynamic praise, relevant teaching, and community outreach.",
      features: ["Weekly youth fellowship nights", "Annual youth camp & retreats", "Mentorship & leadership tracks", "School outreach initiatives"],
    },
    {
      id: "fellowship",
      title: "Women & Men Fellowships",
      subtitle: "Brotherhood & Sisterhood",
      color: "#0F3E6B",
      badge: "Adults & Couples",
      schedule: "Monthly Meetings & Small Groups",
      shortDesc: "Empowering men and women through dedicated Bible studies, prayer breakfasts, marriage support, and compassionate community care.",
      fullDesc: "Our adult fellowships provide intentional brotherhood and sisterhood where adults encourage one another in faith, career, marriage, parenting, and personal spiritual growth. We believe healthy families create healthy churches and vibrant communities.",
      features: ["Men's Brotherhood breakfasts", "Women of Grace prayer fellowships", "Marriage enrichment seminars", "Benevolence & hospital visitations"],
    },
    {
      id: "music",
      title: "Choir & Music Ministry",
      subtitle: "Voices of Praise",
      color: "#1F6FB5",
      badge: "Worship & Arts",
      schedule: "Rehearsals: Thursdays at 6:30 PM",
      shortDesc: "Ushering the congregation into God's presence through inspirational hymns, contemporary gospel praise, and instrumental excellence.",
      fullDesc: "The Changed Life Choir and Praise Team lead our congregation in reverent, spirit-led worship each Sunday. Rooted in theology and artistic excellence, this team is dedicated to lifting high the name of Jesus and preparing hearts for God's Word.",
      features: ["Choral harmony and vocal training", "Contemporary & traditional hymnody", "Instrumental & band development", "Special seasonal cantatas"],
    },
  ];

  return (
    <section id="ministries" className="py-16 sm:py-24 px-4 sm:px-8 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C62828] bg-red-50 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Connect &amp; Grow</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-[42px] font-bold text-[#0F3E6B] leading-tight">
            Ministries for every season of life
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            There is a place for everyone in the Changed Life family. Discover a ministry designed to nurture your spiritual walk and connect you with others.
          </p>
        </div>

        {/* 4 Cards matching mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ministries.map((ministry) => (
            <div
              key={ministry.id}
              onClick={() => setActiveMinistry(ministry)}
              className="border border-[#E1E6EE] rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              {/* Colored top header block */}
              <div>
                <div
                  className="h-36 sm:h-40 flex flex-col justify-between p-5 text-white relative overflow-hidden"
                  style={{ backgroundColor: ministry.color }}
                >
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-md pointer-events-none" />
                  <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-black/20 backdrop-blur px-2.5 py-0.5 rounded-full self-start">
                    {ministry.badge}
                  </span>
                  <div>
                    <div className="text-xs text-white/80 font-medium">{ministry.subtitle}</div>
                    <div className="font-serif text-xl font-bold leading-tight mt-0.5 text-white">
                      {ministry.title}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <p className="text-sm text-[#4A5565] leading-relaxed line-clamp-3">
                    {ministry.shortDesc}
                  </p>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#1F6FB5]" />
                    <span className="truncate">{ministry.schedule}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="px-5 pb-5 pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F3E6B] group-hover:text-[#C62828] transition-colors">
                  <span>Explore ministry</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {activeMinistry && (
        <Dialog open={!!activeMinistry} onOpenChange={() => setActiveMinistry(null)}>
          <DialogContent className="max-w-lg w-[95vw] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
            <div
              className="p-6 text-white relative"
              style={{ backgroundColor: activeMinistry.color }}
            >
              <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-black/20 px-2.5 py-0.5 rounded-full mb-2">
                {activeMinistry.badge}
              </span>
              <DialogTitle className="font-serif text-2xl font-bold text-white tracking-normal">
                {activeMinistry.title}
              </DialogTitle>
              <div className="text-white/80 text-xs font-medium mt-1">
                {activeMinistry.subtitle} · {activeMinistry.schedule}
              </div>
            </div>

            <div className="p-6 bg-white space-y-4 text-xs sm:text-sm">
              <p className="text-slate-700 leading-relaxed">
                {activeMinistry.fullDesc}
              </p>

              <div className="space-y-2 pt-1">
                <span className="font-bold text-[#0F3E6B] block">What We Focus On:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeMinistry.features.map((feat: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#1F6FB5] flex-shrink-0" />
                      <span className="text-xs">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Have questions about joining?</span>
                <Button
                  size="sm"
                  className="bg-[#0F3E6B] hover:bg-[#164C80] text-white text-xs rounded-xl"
                  onClick={() => setActiveMinistry(null)}
                >
                  Close &amp; Visit Sunday
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};
