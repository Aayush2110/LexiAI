import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User, ArrowRight, Github } from "lucide-react";
import { AuthAPI } from "@/services/api";
import { AuthShell, Field, Divider } from "./login";

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await AuthAPI.signup(email, password);
    setLoading(false);
    nav({ to: "/dashboard" });
  };

  return (
    <AuthShell title="Create your account" subtitle="Start your 14-day trial. No credit card needed.">
      <form onSubmit={submit} className="space-y-4">
        <Field icon={User} label="Full name" type="text" value={name} onChange={setName} placeholder="Alex Kim" />
        <Field icon={Mail} label="Work email" type="email" value={email} onChange={setEmail} placeholder="alex@firm.com" />
        <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" />
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl gradient-bg text-white px-4 py-2.5 text-sm font-medium shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"} <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <Divider />
      <button className="w-full flex items-center justify-center gap-2 rounded-xl glass px-4 py-2.5 text-sm hover:border-primary/40 transition-colors">
        <Github className="h-4 w-4" /> Sign up with GitHub
      </button>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="text-primary hover:underline">Log in</Link>
      </p>
    </AuthShell>
  );
}
