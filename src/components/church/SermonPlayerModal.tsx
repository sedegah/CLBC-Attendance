import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Volume2, Share2, BookOpen, Clock, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SermonPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  preacher?: string;
  date?: string;
  scripture?: string;
}

export const SermonPlayerModal = ({
  open,
  onOpenChange,
  title = "Walking in Faith and Truth",
  preacher = "Senior Pastor",
  date = "Recent Sunday Worship",
  scripture = "Colossians 2:6-7",
}: SermonPlayerModalProps) => {
  const { toast } = useToast();

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${title} - Changed Life Baptist Church`,
        text: `Watch the message "${title}" by ${preacher}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied to clipboard",
        description: "You can now share this sermon message with others.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Media Frame */}
        <div className="relative aspect-video bg-[#082A4B] flex items-center justify-center overflow-hidden">
          {/* Subtle gradient pattern */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0F3E6B] via-[#082A4B] to-[#1F6FB5]/30 opacity-90" />
          
          <div className="relative z-10 text-center p-6 space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto hover:scale-105 transition-transform cursor-pointer group">
              <Play className="w-7 h-7 sm:w-8 sm:h-8 text-[#C62828] fill-[#C62828] ml-1 group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur">
                Streaming Online Service
              </span>
              <p className="text-white/80 text-xs sm:text-sm">Click play to watch full worship and sermon</p>
            </div>
          </div>
        </div>

        {/* Details & Notes */}
        <div className="p-5 sm:p-6 bg-white space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#1F6FB5]" />
                  {date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#1F6FB5]" />
                  42 mins
                </span>
              </div>
              <DialogTitle className="font-serif text-xl sm:text-2xl font-bold text-[#0F3E6B]">
                {title}
              </DialogTitle>
              <div className="text-sm font-medium text-slate-700 mt-1">
                Speaker: <span className="text-[#1F6FB5]">{preacher}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-1.5 text-xs text-slate-700 hover:text-[#0F3E6B] border-slate-200"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
          </div>

          <div className="bg-[#F4F7FB] border border-[#E6E9EE] rounded-xl p-4 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 font-semibold text-[#0F3E6B]">
              <BookOpen className="w-4 h-4 text-[#1F6FB5]" />
              <span>Key Scripture Focus: {scripture}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              In this message, we explore biblical foundations for genuine discipleship, standing strong in Christ amid life's trials, and walking in the fullness of God's grace.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Changed Life Baptist Church Media Ministry</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-[#0F3E6B] gap-1.5"
              onClick={() => {
                toast({
                  title: "Audio Download",
                  description: "Audio MP3 stream initialized.",
                });
              }}
            >
              <Volume2 className="w-3.5 h-3.5" />
              Listen Audio Only
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
