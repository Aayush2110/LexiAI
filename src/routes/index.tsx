import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Scale, Sparkles, Shield, Zap, FileText, ArrowRight, Check, Github,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LexiAI — AI Legal Assistant for Contracts & Documents" },
      {
        name: "description",
        content:
          "LexiAI reads your contracts, surfaces risks, and answers legal questions with cited sources. RAG-powered legal intelligence.",
      },
      { property: "og:title", content: "LexiAI — AI Legal Assistant" },
      {
        property: "og:description",
        content: "Upload legal documents and ask questions instantly.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Subtle gradient backdrop - monochrome */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(255, 255, 255, 0.05), transparent 60%), radial-gradient(50% 40% at 80% 20%, rgba(255, 255, 255, 0.03), transparent 60%)",
        }}
      />

      {/* Nav */}
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center transition-all duration-300">
              <Scale className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight">LexiAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors duration-200">Features</a>
            <a href="#how" className="hover:text-foreground transition-colors duration-200">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors duration-200">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300"
            >
              Log in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent border border-border text-xs text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5" />
          RAG-powered legal intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]"
        >
          Your AI co-counsel for{" "}
          <span className="text-foreground">contracts & clauses</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Upload PDFs, NDAs, and MSAs. Ask anything in plain English.
          LexiAI returns precise, cited answers grounded in your documents.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-9 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            to="/chat"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all duration-300"
          >
            Try the assistant <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-surface hover:border-muted-foreground/50 transition-all duration-200"
          >
            <Github className="h-4 w-4" /> See how it works
          </a>
        </motion.div>

        {/* Hero preview card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-16 mx-auto max-w-4xl"
        >
          <div className="rounded-3xl border border-border p-1.5">
            <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 text-left">
              <div className="flex items-center gap-2 mb-5">
                <span className="h-3 w-3 rounded-full bg-destructive/70" />
                <span className="h-3 w-3 rounded-full bg-warning/80" />
                <span className="h-3 w-3 rounded-full bg-success/80" />
                <span className="ml-3 text-[11px] text-muted-foreground">lexi.ai/chat</span>
              </div>
              <div className="space-y-4">
                <div className="self-end ml-auto max-w-[80%] rounded-2xl bg-primary text-primary-foreground px-4 py-3 text-sm w-fit">
                  Summarize the termination clause in MSA_v3.pdf
                </div>
                <div className="bg-accent border border-border rounded-2xl px-4 py-3.5 text-sm max-w-[90%] hover:border-muted-foreground/50 transition-all duration-200">
                  <p className="leading-relaxed">
                    Either party may terminate on <strong>30 days' written notice</strong> for material breach
                    not cured within the notice window. Mutual obligations under
                    <em> §7 Confidentiality</em> survive termination.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg bg-background border border-border">
                      <FileText className="h-3 w-3" /> MSA_v3 · p.4
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-lg bg-background border border-border">
                      <FileText className="h-3 w-3" /> MSA_v3 · p.7
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Built for <span className="text-foreground">legal teams</span>
          </h2>
          <p className="mt-3 text-muted-foreground">Everything you need to move fast — without skipping the fine print.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface border border-border rounded-2xl p-6 hover:border-muted-foreground/50 transition-all duration-150"
            >
              <div className="h-12 w-12 rounded-xl bg-accent border border-border grid place-items-center mb-5">
                <f.icon className="h-5.5 w-5.5" />
              </div>
              <div className="font-semibold text-base">{f.title}</div>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative bg-surface border border-border rounded-2xl p-6">
              <div className="text-xs font-semibold text-muted-foreground mb-2">Step {i + 1}</div>
              <div className="text-lg font-semibold">{s.title}</div>
              <p className="text-sm text-muted-foreground mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section id="pricing" className="max-w-5xl mx-auto px-5 sm:px-8 py-20 text-center">
        <div className="border border-border rounded-3xl p-10 bg-surface">
          <h3 className="text-2xl sm:text-3xl font-semibold">Start free. Scale when you're ready.</h3>
          <p className="mt-3 text-muted-foreground">All core features included during beta.</p>
          <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto text-sm text-left">
            {["Unlimited chats", "Up to 100 documents", "Source-cited answers", "Team workspaces"].map((p) => (
              <li key={p} className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-success" /> {p}
              </li>
            ))}
          </ul>
          <Link
            to="/signup"
            className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all duration-150"
          >
            Create your account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LexiAI · Built for legal professionals
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: Sparkles, title: "Cited answers", desc: "Every response links back to the source clause and page." },
  { icon: Shield, title: "Risk detection", desc: "Surface ambiguous, unfair, or unusual contract language." },
  { icon: Zap, title: "Lightning fast", desc: "Sub-second retrieval across thousands of pages." },
];
const STEPS = [
  { title: "Upload your documents", desc: "PDF, DOCX, TXT — drop them in. Indexed in seconds." },
  { title: "Ask in plain English", desc: "No prompt engineering. Just ask like you would a junior associate." },
  { title: "Get cited insights", desc: "Answers grounded in your files with confidence scores." },
];
