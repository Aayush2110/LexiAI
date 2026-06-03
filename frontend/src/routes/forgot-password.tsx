import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { AuthShell, Field } from "./login";
import { toast } from "sonner";
import api from "@/services/api";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — LexiAI" },
      { name: "description", content: "Reset your LexiAI password." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setSent(true);
      setLoading(false);
      toast.success(response.data.message || "Password reset email sent!");
    } catch (err: any) {
      const errorMsg = err?.detail || err?.message || "Failed to send reset email";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell 
        title="Check your email" 
        subtitle={`We've sent password reset instructions to ${email}`}
      >
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-primary hover:underline"
          >
            Try another email
          </button>
        </div>
        <div className="mt-6 pt-6 border-t border-border">
          <Link 
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell 
      title="Forgot password?" 
      subtitle="Enter your email and we'll send you reset instructions."
    >
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

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:opacity-90 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Sending…" : "Send reset link"} <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-border">
        <Link 
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
      </p>
    </AuthShell>
  );
}
