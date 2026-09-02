import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.svg";
import { ArrowRight, Loader2, User, Phone, CheckCircle, Shield } from "lucide-react";
import { Suspense, useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const {
    isLoading: authLoading,
    isAuthenticated,
    signIn,
  } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );

  // ─── State ─────────────────────────────────────────────────
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp-sent" | "verifying" | "success">("input");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Redirect if already authenticated ─────────────────────
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  // ─── Resend timer countdown ────────────────────────────────
  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendTimer]);

  // ─── Derived state ─────────────────────────────────────────
  const formattedPhone = phone.startsWith("91") ? phone : `91${phone}`;
  const displayPhone = `+91 ${phone}`;
  const isValidPhone = phone.length === 10 && /^[6-9]\d{9}$/.test(phone);

  // ─── Step 1: Send OTP ──────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidPhone) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Send OTP via phone-otp Convex auth provider
      const formData = new FormData();
      formData.set("email", formattedPhone); // provider uses 'email' field as identifier
      await signIn("phone-otp", formData);

      setSuccess(`OTP sent to ${displayPhone}`);
      setStep("otp-sent");
      setResendTimer(30);
    } catch (err) {
      console.error("[Auth] Send OTP failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send OTP. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    setError(null);
    setStep("verifying");

    try {
      // Verify OTP via phone-otp Convex auth provider
      const formData = new FormData();
      formData.set("email", formattedPhone); // provider identifier
      formData.set("code", otp);
      await signIn("phone-otp", formData);

      // Success — show success state briefly then redirect
      setStep("success");
      setSuccess("Phone verified successfully!");

      // The useEffect watching isAuthenticated will handle redirect
    } catch (err) {
      console.error("[Auth] Verify OTP failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Invalid OTP. Please check and try again.",
      );
      setStep("otp-sent");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Resend OTP ────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.set("email", formattedPhone);
      await signIn("phone-otp", formData);

      setSuccess(`New OTP sent to ${displayPhone}`);
      setResendTimer(30);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resend OTP.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Guest Login ───────────────────────────────────────────
  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      // useEffect will handle redirect
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in as guest.",
      );
      setIsLoading(false);
    }
  };

  // ─── Reset to input step ───────────────────────────────────
  const handleBackToInput = () => {
    setStep("input");
    setOtp("");
    setError(null);
    setSuccess(null);
  };

  // ─── Loading state while checking auth ─────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--meesho-pink)]" />
      </div>
    );
  }

  // ─── Already authenticated ─────────────────────────────────
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <CheckCircle className="h-12 w-12 text-[var(--meesho-green)] mb-4" />
        <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--meesho-pink)]/5 blur-[120px] pointer-events-none" />

      {/* Logo */}
      <div className="mb-8 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-[var(--meesho-pink)] flex items-center justify-center shadow-lg shadow-[var(--meesho-pink)]/20">
          <img
            src={logo}
            alt="Logo"
            width={36}
            height={36}
            className="brightness-0 invert"
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm animate-fade-in" style={{ animationDelay: "100ms" }}>

        {/* ═══════════════════════════════════════════════════════
            STEP: INPUT — Phone number entry
           ═══════════════════════════════════════════════════════ */}
        {step === "input" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your phone number to sign in
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-3">
              {/* Phone input with +91 prefix */}
              <div className="relative group">
                <div className="flex items-center h-12 bg-card border border-border/50 rounded-lg focus-within:border-[var(--meesho-pink)]/30 focus-within:ring-1 focus-within:ring-[var(--meesho-pink)]/10 transition-all">
                  {/* +91 Country Code */}
                  <div className="flex items-center gap-1.5 pl-3 border-r border-border/50 pr-2.5 h-full">
                    <span className="text-sm font-medium text-foreground">🇮🇳</span>
                    <span className="text-sm font-medium text-muted-foreground">+91</span>
                  </div>

                  {/* Phone Input */}
                  <input
                    name="phone"
                    placeholder="9876543210"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setPhone(val);
                      setError(null);
                    }}
                    className="flex-1 h-full px-3 bg-transparent text-sm placeholder:text-muted-foreground/50 focus:outline-none"
                    disabled={isLoading}
                    autoFocus
                    required
                  />

                  {/* Submit Arrow */}
                  <button
                    type="submit"
                    className="flex items-center justify-center h-10 w-10 mr-1 rounded-lg hover:bg-muted transition-colors"
                    disabled={isLoading || !isValidPhone}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[var(--meesho-pink)]" />
                    ) : (
                      <ArrowRight className={`h-4 w-4 transition-colors ${isValidPhone ? "text-[var(--meesho-pink)]" : "text-muted-foreground/30"}`} />
                    )}
                  </button>
                </div>

                {/* Phone validation hint */}
                {phone.length > 0 && phone.length < 10 && (
                  <p className="text-[11px] text-muted-foreground mt-1.5 pl-1">
                    {10 - phone.length} more digit{10 - phone.length !== 1 ? "s" : ""} needed
                  </p>
                )}
                {phone.length === 10 && !isValidPhone && (
                  <p className="text-[11px] text-[var(--meesho-red)] mt-1.5 pl-1">
                    Invalid number — must start with 6, 7, 8, or 9
                  </p>
                )}
              </div>

              {error && (
                <p className="text-sm text-[var(--meesho-red)] text-center animate-fade-in">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[var(--meesho-pink)] text-white hover:bg-[var(--meesho-pink)]/90 font-medium transition-all shadow-lg shadow-[var(--meesho-pink)]/25 meesho-btn"
                disabled={isLoading || !isValidPhone}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-[11px] text-muted-foreground uppercase tracking-widest">
                  or
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-border/50 bg-card hover:bg-muted/50 hover:border-border transition-all"
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              <User className="mr-2 h-4 w-4" />
              Continue as Guest
            </Button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Secure OTP</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>Phone Verified</span>
              </div>
            </div>

            <p className="text-[11px] text-center text-muted-foreground/60 px-4">
              By continuing, you agree to our{" "}
              <a href="#" className="text-foreground hover:underline">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-foreground hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            STEP: OTP SENT — Waiting for OTP input
           ═══════════════════════════════════════════════════════ */}
        {step === "otp-sent" && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--meesho-green)]/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-[var(--meesho-green)]" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                Verify Your Phone
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                We sent a 6-digit code to{" "}
                <span className="text-foreground font-medium">
                  {displayPhone}
                </span>
              </p>
            </div>

            {success && (
              <p className="text-sm text-[var(--meesho-green)] text-center animate-fade-in">
                {success}
              </p>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={(val) => {
                    setOtp(val);
                    setError(null);
                  }}
                  maxLength={6}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && otp.length === 6) {
                      const form = (e.target as HTMLElement).closest("form");
                      if (form) form.requestSubmit();
                    }
                  }}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && (
                <p className="text-sm text-[var(--meesho-red)] text-center animate-fade-in">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-[var(--meesho-pink)] text-white hover:bg-[var(--meesho-pink)]/90 font-medium transition-all shadow-lg shadow-[var(--meesho-pink)]/25 meesho-btn"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                {resendTimer > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend OTP in{" "}
                    <span className="text-foreground font-medium">
                      {resendTimer}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-[var(--meesho-pink)] font-medium hover:underline underline-offset-4"
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleBackToInput}
                  className="block w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Change phone number
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            STEP: VERIFYING — OTP verification in progress
           ═══════════════════════════════════════════════════════ */}
        {step === "verifying" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--meesho-pink)] mb-4" />
            <p className="text-sm font-medium">Verifying OTP...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Please wait while we verify your phone number
            </p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            STEP: SUCCESS — Auth complete, redirecting
           ═══════════════════════════════════════════════════════ */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-[var(--meesho-green)]/10 flex items-center justify-center mb-4 animate-fade-in-scale">
              <CheckCircle className="h-8 w-8 text-[var(--meesho-green)]" />
            </div>
            <p className="text-sm font-medium animate-fade-in" style={{ animationDelay: "100ms" }}>
              Welcome! Redirecting...
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 py-3 text-[11px] text-center text-muted-foreground/60">
          Secured by{" "}
          <a
            href="https://freebuff.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            freebuff.com
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
