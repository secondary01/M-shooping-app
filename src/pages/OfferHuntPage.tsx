import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Loader2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DISCOUNT_BUCKETS = [110, 120, 135, 150, 180];

export default function OfferHuntPage() {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [hunting, setHunting] = useState(false);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [liveLog, setLiveLog] = useState<string[]>([]);
  const [completedHunt, setCompletedHunt] = useState<any>(null);

  const addLog = useCallback((msg: string) => {
    setLiveLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  const handleStartHunt = async () => {
    if (!selectedTarget) return;
    setHunting(true);
    setCurrentAttempt(0);
    setLiveLog([]);
    setCompletedHunt(null);

    addLog(`Hunt started — Target: ₹${selectedTarget}`);
    addLog(`Max attempts: 15 · Simulating device rotation...`);

    for (let i = 1; i <= 15; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setCurrentAttempt(i);
      const devices = ["Android/Chrome/1080x2400", "iOS/Safari/1170x2532", "Android/Firefox/1080x2340", "Android/Samsung/1080x2340"];
      addLog(`Attempt ${i}/15 — Device: ${devices[i % devices.length]}`);

      // Simulate finding a discount
      if (i >= 8 && Math.random() > 0.3) {
        const found = Math.min(selectedTarget, 120 + Math.floor(Math.random() * 60));
        addLog(`✓ Discount found: ₹${found}`);
        setCompletedHunt({ bestDiscount: found, status: found >= selectedTarget ? "success" : "fallback" });
        setHunting(false);
        toast.success(`Found ₹${found} discount!`);
        return;
      }
    }

    addLog("Hunt completed — best discount: ₹110");
    setCompletedHunt({ bestDiscount: 110, status: "fallback" });
    setHunting(false);
  };

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="ml-4 text-base font-semibold">Offer Hunt</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {!hunting && !completedHunt && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Select Target Discount</p>
            <div className="grid grid-cols-5 gap-2">
              {DISCOUNT_BUCKETS.map((bucket) => (
                <button
                  key={bucket}
                  onClick={() => setSelectedTarget(bucket)}
                  className={cn(
                    "rounded-lg border py-3 text-center transition-all",
                    selectedTarget === bucket ? "border-foreground bg-foreground text-white" : "border-border text-foreground hover:border-foreground/50",
                  )}
                >
                  <p className="text-sm font-semibold">₹{bucket}</p>
                </button>
              ))}
            </div>
            <Button onClick={handleStartHunt} disabled={!selectedTarget} className="mt-4 w-full h-11 bg-[var(--meesho-pink)] text-white">
              <Target className="mr-2 h-4 w-4" /> Start Hunt
            </Button>
          </div>
        )}

        {hunting && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Hunting...</span>
                </div>
                <span className="text-xs text-muted-foreground">{currentAttempt}/15</span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-[var(--meesho-pink)] transition-all duration-500 rounded-full" style={{ width: `${(currentAttempt / 15) * 100}%` }} />
              </div>
            </div>
            <div className="rounded-lg border border-border p-3 max-h-48 overflow-y-auto">
              <div className="space-y-0.5">
                {liveLog.map((line, i) => (
                  <p key={i} className="text-[10px] font-mono text-muted-foreground">{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {completedHunt && !hunting && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">Hunt Complete</p>
            </div>
            <p className="text-xs text-green-700">Best Discount: ₹{completedHunt.bestDiscount}</p>
            <Button onClick={() => { setCompletedHunt(null); setSelectedTarget(null); }} variant="outline" className="mt-3 w-full" size="sm">New Hunt</Button>
          </div>
        )}
      </div>
    </div>
  );
}
