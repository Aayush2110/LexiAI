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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    tab === t.id
                      ? "glass border-primary/40 text-foreground"
                      : "text-muted-foreground hover:bg-accent/50"
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-6 space-y-5"
            >
              {tab === "profile" && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl gradient-bg grid place-items-center text-white font-semibold">AK</div>
                    <div>
                      <div className="font-semibold">Alex Kim</div>
                      <div className="text-xs text-muted-foreground">alex@lexi.ai</div>
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
                        className={`rounded-xl glass p-3 text-sm hover:border-primary/40 transition-colors ${
                          i === 0 ? "border-primary/60" : ""
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <Toggle label="Reduced motion" desc="Disable non-essential animations." />
                </>
              )}

              <div className="pt-4 border-t border-border flex justify-end">
                <button
                  onClick={save}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-bg text-white text-sm font-medium shadow-md shadow-primary/30"
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
        className="mt-1.5 w-full rounded-xl glass px-3 py-2.5 text-sm outline-none focus:border-primary/50 transition-colors"
      />
    </label>
  );
}

function Toggle({ label, desc, defaultOn = false }: { label: string; desc: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <button
        onClick={() => setOn((v) => !v)}
        className={`relative h-6 w-11 rounded-full transition-colors ${on ? "gradient-bg" : "bg-muted"}`}
      >
        <motion.span
          animate={{ x: on ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 h-4 w-4 rounded-full bg-white shadow"
        />
      </button>
    </div>
  );
}
