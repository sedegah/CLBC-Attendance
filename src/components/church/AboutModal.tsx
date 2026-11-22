import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Church, Shield, Users, Heart, BookOpen, Compass } from "lucide-react";

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AboutModal = ({ open, onOpenChange }: AboutModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-[#0F3E6B] text-white p-6 sm:p-7 relative">
          <div className="flex items-center gap-2 text-[#388CD4] text-xs font-semibold tracking-wider uppercase mb-1">
            <Church className="w-4 h-4" />
            <span>Since 1976</span>
          </div>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-normal">
            About Changed Life Baptist Church
          </DialogTitle>
          <DialogDescription className="text-[#DBE7F5] text-xs sm:text-sm mt-1 leading-relaxed">
            A biblical family of believers committed to Christ, community discipleship, and gospel transformation.
          </DialogDescription>
        </div>

        <div className="p-5 sm:p-7 bg-white space-y-6 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
          {/* History */}
          <div className="space-y-2">
            <h4 className="font-serif text-base sm:text-lg font-bold text-[#0F3E6B] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#C62828]" />
              Our Heritage &amp; Journey
            </h4>
            <p className="text-slate-600 leading-relaxed">
              Founded in 1976, Changed Life Baptist Church (C.L.B.C) has been a steadfast spiritual home for generations of believers. Over the decades, our mission has remained unwavering: to exalt Jesus Christ, preach the uncompromised Word of God, and equip believers for fruitful service in their homes, workplaces, and communities.
            </p>
          </div>

          {/* Core Values */}
          <div className="space-y-3">
            <h4 className="font-serif text-base sm:text-lg font-bold text-[#0F3E6B] flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1F6FB5]" />
              Core Pillars of Faith
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#F4F7FB] border border-[#E6E9EE] p-3.5 rounded-xl space-y-1">
                <div className="font-semibold text-[#0F3E6B] flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#1F6FB5]" />
                  Biblical Authority
                </div>
                <p className="text-slate-600 text-xs leading-normal">
                  The Holy Scriptures are our ultimate guide for faith, doctrine, and daily Christian living.
                </p>
              </div>

              <div className="bg-[#F4F7FB] border border-[#E6E9EE] p-3.5 rounded-xl space-y-1">
                <div className="font-semibold text-[#0F3E6B] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#1F6FB5]" />
                  Loving Community
                </div>
                <p className="text-slate-600 text-xs leading-normal">
                  Fostering genuine spiritual fellowship where every member is loved, valued, and nurtured.
                </p>
              </div>

              <div className="bg-[#F4F7FB] border border-[#E6E9EE] p-3.5 rounded-xl space-y-1">
                <div className="font-semibold text-[#0F3E6B] flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-[#C62828]" />
                  Christlike Discipleship
                </div>
                <p className="text-slate-600 text-xs leading-normal">
                  Walking in continual spiritual growth, prayer, integrity, and reflection of Jesus Christ.
                </p>
              </div>

              <div className="bg-[#F4F7FB] border border-[#E6E9EE] p-3.5 rounded-xl space-y-1">
                <div className="font-semibold text-[#0F3E6B] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#C62828]" />
                  Gospel Outreach
                </div>
                <p className="text-slate-600 text-xs leading-normal">
                  Sharing the good news of salvation through evangelism, benevolence, and community impact.
                </p>
              </div>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 leading-relaxed space-y-1">
            <span className="font-bold block text-[#0F3E6B]">Everyone Is Welcome</span>
            Whether you are exploring Christianity, seeking a church home, or desiring a deeper relationship with God, there is a place for you at Changed Life Baptist Church.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
