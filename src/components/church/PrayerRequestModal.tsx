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
import { Textarea } from "@/components/ui/textarea";
import { HeartHandshake, CheckCircle2, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PrayerRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PrayerRequestModal = ({ open, onOpenChange }: PrayerRequestModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [category, setCategory] = useState("general");
  const [request, setRequest] = useState("");
  const [isConfidential, setIsConfidential] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;

    setSubmitted(true);
    toast({
      title: "Prayer Request Received",
      description: "Our pastoral and intercessory prayer team will lift this up before the Lord.",
    });

    setTimeout(() => {
      setSubmitted(false);
      onOpenChange(false);
      setName("");
      setContact("");
      setRequest("");
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95vw] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        <div className="bg-[#0F3E6B] text-white p-6 relative">
          <div className="flex items-center gap-2 text-[#388CD4] text-xs font-semibold tracking-wider uppercase mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Prayer Ministry</span>
          </div>
          <DialogTitle className="font-serif text-2xl font-bold text-white tracking-normal">
            Submit a Prayer Request
          </DialogTitle>
          <DialogDescription className="text-[#DBE7F5] text-xs sm:text-sm mt-1 leading-relaxed">
            Whatever you are facing, you don't have to carry it alone. Our prayer team is here to stand with you in faith.
          </DialogDescription>
        </div>

        <div className="p-5 sm:p-6 bg-white">
          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#0F3E6B]">Prayer Request Sent</h3>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">
                Thank you for reaching out. We are praying with you and trusting God for your breakthrough.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="prayer-name" className="text-xs text-slate-700 font-medium">
                    Name (Optional)
                  </Label>
                  <Input
                    id="prayer-name"
                    placeholder="Leave blank for anonymous"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="prayer-contact" className="text-xs text-slate-700 font-medium">
                    Phone / Email (Optional)
                  </Label>
                  <Input
                    id="prayer-contact"
                    placeholder="If you desire follow-up"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-slate-700 font-medium">Category</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "health", label: "Healing" },
                    { id: "family", label: "Family" },
                    { id: "guidance", label: "Guidance" },
                    { id: "finances", label: "Provision" },
                    { id: "salvation", label: "Salvation" },
                    { id: "praise", label: "Thanksgiving" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`text-xs py-1.5 px-2 rounded-lg border font-medium transition-all ${
                        category === c.id
                          ? "bg-[#1F6FB5] text-white border-[#1F6FB5]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="prayer-request" className="text-xs text-slate-700 font-medium">
                  Your Prayer Request *
                </Label>
                <Textarea
                  id="prayer-request"
                  placeholder="Share what is on your heart..."
                  rows={3}
                  value={request}
                  onChange={(e) => setRequest(e.target.value)}
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isConfidential}
                  onChange={(e) => setIsConfidential(e.target.checked)}
                  className="rounded border-slate-300 text-[#0F3E6B] focus:ring-[#0F3E6B]"
                />
                <span className="text-xs text-slate-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  Keep strictly confidential with pastors only
                </span>
              </label>

              <Button
                type="submit"
                className="w-full bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold py-2.5 rounded-xl shadow-md"
              >
                Send Prayer Request
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
