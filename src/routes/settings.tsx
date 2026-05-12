import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Palette, Save, Check } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — LexiAI" },
      { name: "description", content: "Manage your LexiAI workspace preferences." },
    ],
  }),
  component: Settings,
});

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
] as const;

function Settings() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("profile");
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <MainLayout title="Settings" subtitle="Manage your workspace">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
            {/* Tabs */}
            <aside className="space-y-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                    tab === t.id
                      ? "card border-primary text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </aside>

            {/* Panel */}
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card rounded-2xl p-6 space-y-6"
            >
              {tab === "profile" && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">AK</div>
                    <div>
                      <div className="font-semibold text-base">Alex Kim</div>
                      <div className="text-xs text-muted-foreground mt-0.5">alex@lexi.ai</div>
                    </div>
                  </div>
                  <SettingField label="Display name" defaultValue="Alex Kim" />
                  <SettingField label="Email" defaultValue="alex@lexi.ai" type="email" />
                  <SettingField label="Organization" defaultValue="Lexi & Partners LLP" />
                </>
              )}
              {tab === "notifications" && (
                <>
                  <Toggle label="Email digests" desc="Weekly summary of activity." defaultOn />
                  <Toggle label="New citations" desc="Notify me when AI cites a new clause." />
                  <Toggle label="Document processing" desc="Ping me when uploads finish indexing." defaultOn />
                </>
              )}
              {tab === "security" && (
                <>
                  <SettingField label="Current password" type="password" />
                  <SettingField label="New password" type="password" />
                  <Toggle label="Two-factor authentication" desc="Require a code on every login." />
                </>
              )}
              {tab === "appearance" && (
                <>
                  <div className="text-sm font-medium">Theme</div>
                  <div className="grid grid-cols-3 gap-3">
                    {["Dark", "Midnight", "System"].map((t, i) => (
                      <button
                        key={t}
                        className={`rounded-lg card p-3 text-sm hover:border-primary/40 transition-colors ${
                          i === 0 ? "border-primary" : ""
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <Toggle label="Reduced motion" desc="Disable non-essential animations." />
                </>
              )}

              <div className="pt-5 border-t border-border flex justify-end">
                <button
                  onClick={save}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-150"
                >
                  {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved ? "Saved" : "Save changes"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function SettingField({
  label, defaultValue = "", type = "text",
}: { label: string; defaultValue?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-foreground/30 transition-all duration-150"
      />
    </label>
  );
}

function Toggle({ label, desc, defaultOn = false }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`relative h-7 w-12 rounded-full transition-all duration-150 ${on ? "bg-primary" : "bg-accent border border-border"}`}
      >
        <motion.span
          animate={{ x: on ? 24 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-1 h-5 w-5 rounded-full ${on ? "bg-primary-foreground" : "bg-foreground"}`}
        />
      </button>
    </div>
  );
}
