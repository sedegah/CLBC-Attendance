import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Users, MapPin, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlanVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PlanVisitModal = ({ open, onOpenChange }: PlanVisitModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("sunday-1030");
  const [guests, setGuests] = useState("1");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitted(true);
    toast({
      title: "We can't wait to meet you!",
      description: `Thank you ${name}. Our hospitality team will be ready to welcome you at Changed Life Baptist Church.`,
    });

    setTimeout(() => {
      setSubmitted(false);
      onOpenChange(false);
      setName("");
      setEmail("");
      setPhone("");
      setNotes("");
    }, 2200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Banner */}
        <div className="bg-[#0F3E6B] text-white p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 text-[#388CD4] text-xs font-semibold tracking-wider uppercase mb-1">
            <Calendar className="w-4 h-4" />
            <span>Welcome Home</span>
          </div>
          <DialogTitle className="font-serif text-2xl font-bold text-white tracking-normal">
            Plan Your Visit
          </DialogTitle>
          <DialogDescription className="text-[#DBE7F5] text-xs sm:text-sm mt-1 leading-relaxed">
            Let us know you're coming! We will have a friendly host ready to show you around, help with your kids, and save you seats.
          </DialogDescription>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 bg-white">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F3E6B]">You're All Set!</h3>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">
                We've received your visit plan. A warm welcome awaits you and your family this service.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <Label htmlFor="visit-name" className="text-xs text-slate-700 font-medium">
                  Your Full Name *
                </Label>
                <Input
                  id="visit-name"
                  placeholder="e.g. Samuel & Grace Mensah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="visit-phone" className="text-xs text-slate-700 font-medium">
                    Phone / WhatsApp
                  </Label>
                  <Input
                    id="visit-phone"
                    placeholder="+233 24 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="visit-email" className="text-xs text-slate-700 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="visit-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Preferred Service</Label>
                  <Select value={service} onValueChange={setService}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday-800">Sunday 8:00 AM (First Service)</SelectItem>
                      <SelectItem value="sunday-1030">Sunday 10:30 AM (Second Service)</SelectItem>
                      <SelectItem value="midweek-wed">Wednesday 6:30 PM (Bible Study)</SelectItem>
                      <SelectItem value="prayer-fri">Friday 7:00 PM (Prayer Meeting)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Guests Count</Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Guests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Just Me (1)</SelectItem>
                      <SelectItem value="2">2 People</SelectItem>
                      <SelectItem value="3-4">3 - 4 Family Members</SelectItem>
                      <SelectItem value="5+">5+ Group / Large Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="visit-notes" className="text-xs text-slate-700 font-medium">
                  Questions or Children's Ages (Optional)
                </Label>
                <Textarea
                  id="visit-notes"
                  placeholder="Tell us if you have kids for Sunday School, need wheelchair access, etc."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold py-2.5 rounded-xl shadow-md"
              >
                Confirm My Visit Plan
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <MapPin className="w-3 h-3 text-[#1F6FB5]" />
                <span>Changed Life Baptist Church · Ashongman Estate, Accra</span>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
