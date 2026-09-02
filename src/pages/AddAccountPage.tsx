import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Smartphone, Gift, CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const BONUS_TIERS = [
  { amount: 110, label: "₹110", description: "Starter" },
  { amount: 120, label: "₹120", description: "Basic" },
  { amount: 135, label: "₹135", description: "Plus" },
  { amount: 150, label: "₹150", description: "Premium" },
  { amount: 180, label: "₹180", description: "Max" },
];

export default function AddAccountPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"tier" | "phone" | "otp" | "done">("tier");
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTierSelect = (amount: number) => {
    setSelectedTier(amount);
    setStep("phone");
  };

  const handleSendOtp = () => {
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setStep("otp");
      setLoading(false);
      toast.success("OTP sent!");
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setTimeout(() => {
      setStep("done");
      setLoading(false);
      toast.success("Account linked!");
    }, 1000);
  };

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="ml-4 text-base font-semibold">Add Account</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {step === "tier" && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Gift className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h2 className="text-lg font-semibold">Select Welcome Bonus</h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {BONUS_TIERS.map((tier) => (
                <button
                  key={tier.amount}
                  onClick={() => handleTierSelect(tier.amount)}
                  className={cn(
                    "rounded-lg border py-3 text-center transition-all",
                    selectedTier === tier.amount ? "border-foreground bg-foreground text-white" : "border-border text-foreground hover:border-foreground/50",
                  )}
                >
                  <p className="text-sm font-semibold">{tier.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "phone" && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Smartphone className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <h2 className="text-lg font-semibold">Enter Mobile Number</h2>
            </div>
            <Input placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} type="tel" className="text-center text-lg tracking-widest" />
            <Button onClick={handleSendOtp} disabled={phone.length !== 10 || loading} className="w-full h-11 bg-[var(--meesho-pink)] text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
            </Button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h2 className="text-lg font-semibold">Verify OTP</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter code sent to {phone}</p>
            </div>
            <div className="flex justify-center">
              <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={loading}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={handleVerifyOtp} disabled={otp.length !== 6 || loading} className="w-full h-11 bg-[var(--meesho-pink)] text-white">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Link"}
            </Button>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4 text-center py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-[var(--meesho-green)]" />
            <h2 className="text-lg font-semibold">Account Linked!</h2>
            <p className="text-sm text-muted-foreground">₹{selectedTier} bonus credited.</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-6 bg-[var(--meesho-pink)] text-white">Go to Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}
