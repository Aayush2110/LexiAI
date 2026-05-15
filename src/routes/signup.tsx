import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { AuthShell, Field, Divider } from "./login";
import { toast } from "sonner";

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
  const { signup, googleLogin, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signup(name, email, password);
      toast.success("Account created successfully!");
      nav({ to: "/chat" });
    } catch (err: any) {
      const errorMsg = err.message || "Signup failed. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Start using LexiAI today.">
      <form onSubmit={submit} className="space-y-4">
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
        
        <div className="relative">
          <Field 
            icon={Lock} 
            label="Password" 
            type={showPassword ? "text" : "password"}
            value={password} 
            onChange={setPassword} 
            placeholder="At least 8 characters"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

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
          {loading ? "Creating account…" : "Create account"} <ArrowRight className="h-4 w-4" />
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
