import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Scale, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — LexiAI" },
      { name: "description", content: "Access your LexiAI legal workspace." },
    ],
  }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const { login, googleLogin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
      toast.success("Welcome back!");
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password, rememberMe);
      toast.success("Welcome back!");
      nav({ to: "/chat" });
    } catch (err: any) {
      const errorMsg = err.message || "Login failed. Please check your credentials.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue with LexiAI.">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <Field 
          icon={Mail} 
          label="Email" 
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
            placeholder="••••••••"
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-border"
              disabled={loading}
            />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:opacity-90 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {isConfigured && (
        <>
          <Divider />
          <div ref={buttonRef} className="w-full flex justify-center" />
        </>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({
  title, subtitle, children,
}: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background text-foreground flex items-center justify-center px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-20"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05), transparent 50%)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-11 w-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Scale className="h-6 w-6" />
          </div>
          <span className="font-semibold text-lg">LexiAI</span>
        </Link>
        <div className="bg-surface border border-border rounded-2xl p-8 sm:p-9">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

export function Field({
  icon: Icon, label, type, value, onChange, placeholder, disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-border bg-background px-3.5 py-3 focus-within:border-foreground/30 transition-all duration-150">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
        />
      </div>
    </label>
  );
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-muted-foreground">
      <span className="flex-1 h-px bg-border" />
      or
      <span className="flex-1 h-px bg-border" />
    </div>
  );
}
