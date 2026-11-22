import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AllEventsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AllEventsModal = ({ open, onOpenChange }: AllEventsModalProps) => {
  const { toast } = useToast();

  const events = [
    {
      date: "DEC 04",
      title: "Night of Worship & Prophetic Prayer",
      time: "7:00 PM - 9:30 PM",
      location: "Main Sanctuary",
      color: "#1F6FB5",
      description: "An evening of intimate worship, thanksgiving, and powerful intercession for families and nations.",
    },
    {
      date: "DEC 11",
      title: "Annual Community Christmas Outreach",
      time: "10:00 AM - 2:00 PM",
      location: "Church Grounds & Community",
      color: "#C62828",
      description: "Sharing the joy of Christ through food hampers, medical care screening, and children's festivities.",
    },
    {
      date: "DEC 18",
      title: "Crossroads Youth & Young Adults Summit",
      time: "5:30 PM - 8:00 PM",
      location: "Youth Chapel",
      color: "#1F6FB5",
      description: "Dynamic panel discussions, praise, and fellowship on navigating faith in today's generation.",
    },
    {
      date: "DEC 25",
      title: "Christmas Day Celebration Service",
      time: "9:00 AM - 11:30 AM",
      location: "Main Sanctuary",
      color: "#C62828",
      description: "Celebrating the birth of our Savior Jesus Christ with choir carols, family dedication, and the Word.",
    },
    {
      date: "DEC 31",
      title: "New Year's Eve Crossover Service",
      time: "9:00 PM - 12:30 AM",
      location: "Main Sanctuary & Overflow",
      color: "#0F3E6B",
      description: "Crossing over into the new year with gratitude, covenant prayers, and divine direction.",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-[#0F3E6B] text-white p-6 relative">
          <div className="flex items-center gap-2 text-[#388CD4] text-xs font-semibold tracking-wider uppercase mb-1">
            <Calendar className="w-4 h-4" />
            <span>Church Calendar</span>
          </div>
          <DialogTitle className="font-serif text-2xl font-bold text-white tracking-normal">
            Upcoming Events &amp; Gatherings
          </DialogTitle>
          <DialogDescription className="text-[#DBE7F5] text-xs sm:text-sm mt-1 leading-relaxed">
            Join us for these special gatherings, outreaches, and services. Everyone is warmly invited!
          </DialogDescription>
        </div>

        <div className="p-5 sm:p-6 bg-white space-y-3.5 max-h-[68vh] overflow-y-auto">
          {events.map((ev, i) => (
            <div
              key={i}
              className="bg-[#F4F7FB] border border-[#E6E9EE] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all hover:border-[#1F6FB5]/50 hover:shadow-sm"
            >
              <div
                className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white font-bold flex-shrink-0 shadow-sm"
                style={{ backgroundColor: ev.color }}
              >
                <span className="text-[10px] tracking-wider uppercase opacity-90">
                  {ev.date.split(" ")[0]}
                </span>
                <span className="text-xl leading-none">
                  {ev.date.split(" ")[1]}
                </span>
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="font-serif text-base font-bold text-[#0F3E6B] leading-tight">
                  {ev.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#1F6FB5]" />
                    {ev.time}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#1F6FB5]" />
                    {ev.location}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-normal pt-1">
                  {ev.description}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-[#0F3E6B] border-[#0F3E6B]/20 hover:bg-[#0F3E6B]/10 self-end sm:self-center"
                onClick={() => {
                  toast({
                    title: "Event Saved",
                    description: `Added "${ev.title}" reminder.`,
                  });
                }}
              >
                Remind Me
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
