import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthShell, Field } from "./login";
import { toast } from "sonner";
import api from "@/services/api";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — LexiAI" },
      { name: "description", content: "Reset your LexiAI password." },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: "/reset-password" }) as { token?: string };
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password strength validation
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (!isPasswordValid) {
      setError("Please meet all password requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        new_password: password,
      });

      setSuccess(true);
      toast.success(response.data.message || "Password reset successful!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 2000);
    } catch (err: any) {
      const errorMsg = err?.detail || err?.message || "Failed to reset password. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthShell title="Invalid Link" subtitle="This password reset link is invalid or has expired.">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">
            Please request a new password reset link.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            Request New Link <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell title="Password Reset Successful!" subtitle="Your password has been updated.">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            You can now login with your new password.
          </p>
          <p className="text-xs text-muted-foreground">
            Redirecting to login page...
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Reset your password" subtitle="Enter your new password below.">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">New Password</span>
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

        <label className="block">
          <span className="text-xs font-medium text-muted-foreground">Confirm Password</span>
          <div className="mt-2 flex items-center gap-2.5 rounded-lg border border-border bg-transparent px-3.5 py-3 focus-within:border-foreground/30 transition-all duration-150 relative">
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              disabled={loading}
              required
              autoComplete="new-password"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 pr-8 autofill:bg-transparent autofill:text-foreground [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:text-foreground [&:-webkit-autofill]:[-webkit-text-fill-color:inherit] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_transparent_inset]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {confirmPassword && (
          <div className="flex items-center gap-2 text-xs">
            {passwordsMatch ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">Passwords match</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-destructive">Passwords do not match</span>
              </>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isPasswordValid || !passwordsMatch}
          className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
        >
          {loading ? "Resetting password…" : "Reset password"} <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-border text-center">
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Back to login
        </Link>
      </div>
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
