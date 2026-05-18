import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { AuthShell, Field, Divider } from "./login";
import { toast } from "sonner";
import api from "@/services/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — LexiAI" },
      { name: "description", content: "Create your LexiAI account." },
    ],
  }),
  component: Signup,
});

function Signup() {
  const nav = useNavigate();
  const { googleLogin, isAuthenticated, setAuth } = useAuth();
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  if (isAuthenticated) {
    nav({ to: "/chat" });
  }

  const handleGoogleSuccess = async (token: string) => {
    try {
      setLoading(true);
      setError("");
      await googleLogin(token);
      toast.success("Account created successfully!");
      nav({ to: "/chat" });
    } catch (err: any) {
      const errorMsg = err.message || "Google authentication failed";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const { buttonRef, isConfigured } = useGoogleAuth({
    onSuccess: handleGoogleSuccess,
    onError: (err) => {
      console.error("Google auth error:", err);
      toast.error("Google authentication failed");
    },
  });

  // Password strength validation
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/signup", {
        name,
        email,
        password,
      });
      
      toast.success(response.data.message || "Verification code sent!");
      setStep("verify");
    } catch (err: any) {
      const errorMsg = err?.detail || err?.message || "Signup failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const submitOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/verify-otp", {
        email,
        otp,
      });
      
      // Set auth state
      setAuth(response.data.access_token, response.data.user);
      
      toast.success("Account created successfully!");
      nav({ to: "/chat" });
    } catch (err: any) {
      const errorMsg = err?.detail || err?.message || "Verification failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/resend-otp", { email });
      toast.success(response.data.message || "New code sent!");
    } catch (err: any) {
      const errorMsg = err?.detail || err?.message || "Failed to resend code.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <AuthShell title="Verify your email" subtitle={`We sent a code to ${email}`}>
        <form onSubmit={submitOTP} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Verification Code</span>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              disabled={loading}
              required
              maxLength={6}
              className="mt-2 w-full rounded-lg border border-border bg-transparent px-3.5 py-3 text-center text-2xl font-mono tracking-widest focus:border-foreground/30 outline-none transition-all duration-150"
            />
          </label>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            {loading ? "Verifying…" : "Verify & Create Account"} <ArrowRight className="h-4 w-4" />
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={resendOTP}
              disabled={loading}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              Didn't receive the code? <span className="text-primary hover:underline">Resend</span>
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setStep("signup");
                setOtp("");
                setError("");
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to signup
            </button>
          </div>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account" subtitle="Start using LexiAI today.">
      <form onSubmit={submitSignup} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Field 
          icon={User} 
          label="Full name" 
          type="text" 
          value={name} 
          onChange={setName} 
          placeholder="Alex Kim"
          disabled={loading}
        />
        
        <Field 
          icon={Mail} 
          label="Work email" 
          type="email" 
          value={email} 
          onChange={setEmail} 
          placeholder="alex@firm.com"
          disabled={loading}
        />
        
        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Password</span>
          <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-border bg-transparent px-3.5 py-3 focus-within:border-foreground/30 transition-all duration-150 relative">
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              disabled={loading}
              required
              autoComplete="new-password"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 pr-8 autofill:bg-transparent autofill:text-foreground [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:text-foreground [&:-webkit-autofill]:[-webkit-text-fill-color:inherit] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_transparent_inset]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {password && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/50 text-xs">
            <p className="font-medium text-muted-foreground">Password requirements:</p>
            <PasswordCheck met={passwordChecks.length}>At least 8 characters</PasswordCheck>
            <PasswordCheck met={passwordChecks.uppercase}>One uppercase letter</PasswordCheck>
            <PasswordCheck met={passwordChecks.lowercase}>One lowercase letter</PasswordCheck>
            <PasswordCheck met={passwordChecks.number}>One number</PasswordCheck>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isPasswordValid}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:opacity-90 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending code…" : "Create account"} <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {isConfigured && (
        <>
          <Divider />
          <div ref={buttonRef} className="w-full flex justify-center" />
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">Log in</Link>
      </p>
    </AuthShell>
  );
}

function PasswordCheck({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <div className="h-3.5 w-3.5 rounded-full border border-muted-foreground/30" />
      )}
      <span className={met ? "text-foreground" : "text-muted-foreground"}>{children}</span>
    </div>
  );
}
