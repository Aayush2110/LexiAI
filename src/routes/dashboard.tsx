import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  FileText, MessageSquare, TrendingUp, Sparkles, ArrowUpRight, Activity, Upload, Search,
} from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LexiAI" },
      { name: "description", content: "Your legal AI workspace overview." },
    ],
  }),
  component: Dashboard,
});

const STATS = [
  { label: "Documents", value: "24", trend: "+3", icon: FileText },
  { label: "Conversations", value: "182", trend: "+12", icon: MessageSquare },
  { label: "Tokens used", value: "1.2M", trend: "+8%", icon: Activity },
  { label: "Avg confidence", value: "94%", trend: "+2%", icon: TrendingUp },
];

const RECENT = [
  { name: "MSA_v3.pdf", size: "412 KB", time: "2h ago", status: "Indexed" },
  { name: "NDA_Acme.pdf", size: "118 KB", time: "5h ago", status: "Indexed" },
  { name: "Schedule_A.pdf", size: "76 KB", time: "Yesterday", status: "Processing" },
  { name: "Lease_2024.docx", size: "234 KB", time: "2d ago", status: "Indexed" },
];

const ACTIVITY = [22, 28, 19, 35, 41, 33, 48, 52, 44, 58, 61, 72];

function Dashboard() {
  const max = Math.max(...ACTIVITY);
  return (
    <MainLayout title="Dashboard" subtitle="Your AI legal workspace">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 space-y-8">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h2 className="text-2xl font-semibold">
                Welcome back, <span className="gradient-text">Alex</span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Here's what's happening across your workspace today.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium shadow-md shadow-primary/30"
              >
                <Sparkles className="h-4 w-4" /> New chat
              </Link>
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm hover:border-primary/40 transition-colors"
              >
                <Upload className="h-4 w-4" /> Upload
              </Link>
            </div>
          </motion.div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center text-primary">
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] text-success">{s.trend}</span>
                </div>
                <div className="mt-4 text-2xl font-semibold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Activity + Quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-sm font-semibold">AI Activity</div>
                  <div className="text-xs text-muted-foreground">Last 12 weeks</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-md bg-primary/15 text-primary border border-primary/20">
                  Trending up
                </span>
              </div>
              <div className="flex items-end gap-2 h-44">
                {ACTIVITY.map((v, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${(v / max) * 100}%` }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 120 }}
                    className="flex-1 rounded-t-md gradient-bg opacity-90 hover:opacity-100 transition-opacity"
                  />
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6 space-y-3">
              <div className="text-sm font-semibold">Quick actions</div>
              {[
                { icon: Sparkles, label: "Ask the assistant", to: "/chat" },
                { icon: Upload, label: "Upload a document", to: "/chat" },
                { icon: Search, label: "Search clauses", to: "/chat" },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="flex items-center justify-between p-3 rounded-xl glass hover:border-primary/40 transition-colors"
                >
                  <span className="flex items-center gap-3 text-sm">
                    <span className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 grid place-items-center text-primary">
                      <a.icon className="h-3.5 w-3.5" />
                    </span>
                    {a.label}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent uploads */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Recent uploads</div>
                <div className="text-xs text-muted-foreground">Your latest documents</div>
              </div>
              <Link to="/chat" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-border">
              {RECENT.map((d) => (
                <div key={d.name} className="px-6 py-3 flex items-center gap-4 hover:bg-accent/40 transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground">{d.size} · {d.time}</div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md border ${
                      d.status === "Indexed"
                        ? "bg-success/15 text-success border-success/20"
                        : "bg-warning/15 text-warning border-warning/20"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
