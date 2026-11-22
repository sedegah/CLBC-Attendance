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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Smartphone, CreditCard, Building2, Copy, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GiveOnlineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GiveOnlineModal = ({ open, onOpenChange }: GiveOnlineModalProps) => {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedFund, setSelectedFund] = useState("tithe");
  const [customAmount, setCustomAmount] = useState("");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast({
      title: "Copied to clipboard",
      description: `${label}: ${text}`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Header Banner */}
        <div className="bg-[#C62828] text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 text-white/80 text-xs font-semibold tracking-wider uppercase mb-1">
            <Heart className="w-4 h-4 fill-white/80 text-white/80" />
            <span>Kingdom Stewardship</span>
          </div>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-normal">
            Online Giving
          </DialogTitle>
          <DialogDescription className="text-white/90 text-sm mt-1.5 leading-relaxed">
            Support the ministries, community outreach, and gospel mission of Changed Life Baptist Church.
          </DialogDescription>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 bg-white max-h-[75vh] overflow-y-auto">
          {/* Fund Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Select Giving Category
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "tithe", label: "Tithe" },
                { id: "offering", label: "Offering" },
                { id: "building", label: "Building Fund" },
                { id: "missions", label: "Missions & Care" },
              ].map((fund) => (
                <button
                  key={fund.id}
                  type="button"
                  onClick={() => setSelectedFund(fund.id)}
                  className={`text-xs py-2 px-2.5 rounded-lg font-medium border text-center transition-all ${
                    selectedFund === fund.id
                      ? "bg-[#0F3E6B] text-white border-[#0F3E6B] shadow-sm"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {fund.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <Tabs defaultValue="momo" className="w-full">
            <TabsList className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl">
              <TabsTrigger value="momo" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-white data-[state=active]:text-[#0F3E6B] data-[state=active]:shadow-sm">
                <Smartphone className="w-3.5 h-3.5" />
                Mobile Money
              </TabsTrigger>
              <TabsTrigger value="bank" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-white data-[state=active]:text-[#0F3E6B] data-[state=active]:shadow-sm">
                <Building2 className="w-3.5 h-3.5" />
                Bank Transfer
              </TabsTrigger>
              <TabsTrigger value="card" className="text-xs sm:text-sm font-medium gap-1.5 data-[state=active]:bg-white data-[state=active]:text-[#0F3E6B] data-[state=active]:shadow-sm">
                <CreditCard className="w-3.5 h-3.5" />
                Card / Online
              </TabsTrigger>
            </TabsList>

            {/* Mobile Money Tab */}
            <TabsContent value="momo" className="pt-3 space-y-3">
              <div className="bg-[#F4F7FB] border border-[#E6E9EE] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-[#0F3E6B] text-sm">MTN MoMo / Telecel Cash</div>
                    <div className="text-xs text-slate-500">Merchant Name: Changed Life Baptist Church</div>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    Instant MoMo
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase font-medium">Merchant Code / Number</div>
                    <div className="font-mono font-bold text-slate-900 text-base">024 123 4567</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs text-[#0F3E6B] border-[#0F3E6B]/30 hover:bg-[#0F3E6B]/10"
                    onClick={() => handleCopy("0241234567", "MoMo Number")}
                  >
                    {copiedField === "MoMo Number" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === "MoMo Number" ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5">
                  <div>
                    <div className="text-[11px] text-slate-500 uppercase font-medium">Reference Code</div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {selectedFund.toUpperCase()}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs text-[#0F3E6B] border-[#0F3E6B]/30 hover:bg-[#0F3E6B]/10"
                    onClick={() => handleCopy(selectedFund.toUpperCase(), "Reference")}
                  >
                    {copiedField === "Reference" ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === "Reference" ? "Copied" : "Copy"}
                  </Button>
                </div>

                <p className="text-xs text-slate-600 leading-normal">
                  Dial *170# (MTN) or *110# (Telecel) &gt; Transfer Money &gt; Enter Number &gt; Enter Amount &gt; Use reference <strong className="text-[#0F3E6B]">{selectedFund.toUpperCase()}</strong>.
                </p>
              </div>
            </TabsContent>

            {/* Bank Transfer Tab */}
            <TabsContent value="bank" className="pt-3 space-y-3">
              <div className="bg-[#F4F7FB] border border-[#E6E9EE] rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Bank Name</span>
                  <span className="font-bold text-slate-900">Ecobank Ghana</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Account Name</span>
                  <span className="font-bold text-slate-900">Changed Life Baptist Church</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-slate-500 block">Account Number</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">1441001234567</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-[#0F3E6B]"
                    onClick={() => handleCopy("1441001234567", "Account Number")}
                  >
                    {copiedField === "Account Number" ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Branch</span>
                  <span className="font-semibold text-slate-900">Ashongman Estate / Atomic Branch, Accra</span>
                </div>
              </div>
            </TabsContent>

            {/* Card / Online Tab */}
            <TabsContent value="card" className="pt-3 space-y-3">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="custom-amount" className="text-xs text-slate-700">Amount (GHS / USD)</Label>
                  <Input
                    id="custom-amount"
                    placeholder="Enter amount, e.g. 100"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  className="w-full bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold py-2.5 rounded-xl shadow-md gap-2"
                  onClick={() => {
                    toast({
                      title: "Secure Checkout",
                      description: `Proceeding with ${selectedFund.toUpperCase()} gift. Thank you for your support!`,
                    });
                    onOpenChange(false);
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  Proceed to Secure Giving
                </Button>
                <p className="text-[11px] text-center text-slate-500">
                  Transactions are encrypted and processed securely. You will receive an official tax receipt.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
