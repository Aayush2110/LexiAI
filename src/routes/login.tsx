import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Scale, Mail, Lock, ArrowRight, Github } from "lucide-react";
import { useState } from "react";
import { AuthAPI } from "@/services/api";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await AuthAPI.login(email, password);
    setLoading(false);
    nav({ to: "/dashboard" });
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue with LexiAI.">
      <form onSubmit={submit} className="space-y-4">
        <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="alex@firm.com" />
        <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl gradient-bg text-white px-4 py-2.5 text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <Divider />
      <button className="w-full flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm hover:border-primary/40 transition-colors">
        <Github className="h-4 w-4" /> Continue with GitHub
      </button>
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
    <div className="dark min-h-screen relative overflow-hidden bg-background text-foreground flex items-center justify-center px-4 py-10">
      <div
        className="pointer-events-none absolute inset-0 -z-10 animate-gradient"
        style={{
          background:
            "linear-gradient(120deg, oklch(0.62 0.19 258 / 0.25), oklch(0.62 0.22 295 / 0.25), oklch(0.18 0.03 265) 70%)",
          backgroundSize: "200% 200%",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl gradient-bg grid place-items-center shadow-lg shadow-primary/30">
            <Scale className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg">LexiAI</span>
        </Link>
        <div className="glass-strong rounded-3xl p-7 sm:p-8 shadow-2xl shadow-primary/10">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </motion.div>
    </div>
  );
}

export function Field({
  icon: Icon, label, type, value, onChange, placeholder,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl glass px-3 py-2.5 focus-within:border-primary/50 transition-colors">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
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
