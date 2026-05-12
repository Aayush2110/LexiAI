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
    nav({ to: "/chat" });
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue with LexiAI.">
      <form onSubmit={submit} className="space-y-4">
        <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} placeholder="alex@firm.com" />
        <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white px-4 py-3 text-sm font-medium hover:bg-primary/90 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <Divider />
      <button className="w-full flex items-center justify-center gap-2 rounded-xl card px-4 py-3 text-sm hover:border-primary/50 transition-all duration-200">
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
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-11 w-11 rounded-lg bg-primary flex items-center justify-center">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <span className="font-semibold text-lg">LexiAI</span>
        </Link>
        <div className="card-elevated rounded-2xl p-8 sm:p-9">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
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
      <span className="text-xs font-medium text-muted-foreground/80">{label}</span>
      <div className="mt-2 flex items-center gap-2.5 rounded-lg card px-3.5 py-3 focus-within:border-primary transition-all duration-150">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
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
