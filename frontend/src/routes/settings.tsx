import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Palette, Save, Check } from "lucide-react";
import { MainLayout } from "@/layouts/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

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
  { id: "appearance", label: "Appearance", icon: Palette },
] as const;

function Settings() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("profile");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user, updateProfile } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    organization: user?.organization || "",
  });

  // Sync form data with user data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        organization: user.organization || "",
      });
    }
  }, [user]);

  const save = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      console.log('[Settings] Updating profile with data:', formData);
      
      await updateProfile({
        name: formData.name,
        organization: formData.organization || "",
      });
      
      setSaved(true);
      toast.success("Profile updated successfully!");
      setTimeout(() => setSaved(false), 1800);
    } catch (error: any) {
      console.error('[Settings] Profile update error:', error);
      const errorMessage = error?.message || error?.detail || error?.error || "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                <ProfileTab 
                  user={user} 
                  formData={formData}
                  onInputChange={handleInputChange}
                />
              )}
              {tab === "appearance" && <AppearanceTab />}

              <div className="pt-5 border-t border-border flex justify-end">
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all duration-150 disabled:opacity-50"
                >
                  {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saving ? "Saving..." : saved ? "Saved" : "Save changes"}
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
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-2 w-full rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none focus:border-foreground/30 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
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

function ProfileTab({ 
  user, 
  formData, 
  onInputChange 
}: { 
  user: any; 
  formData: { name: string; organization: string };
  onInputChange: (field: string, value: string) => void;
}) {
  if (!user) return null;
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
          {getInitials(user.name)}
        </div>
        <div>
          <div className="font-semibold text-base">{user.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{user.email}</div>
        </div>
      </div>
      <SettingField 
        label="Display name" 
        value={formData.name}
        onChange={(value) => onInputChange('name', value)}
      />
      <SettingField 
        label="Email" 
        value={user.email}
        onChange={() => {}}
        type="email"
        disabled
      />
      <SettingField 
        label="Organization" 
        value={formData.organization}
        onChange={(value) => onInputChange('organization', value)}
      />
    </>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const themes: Array<{ value: 'dark' | 'light'; label: string }> = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
  ];

  return (
    <>
      <div className="text-sm font-medium">Theme</div>
      <div className="grid grid-cols-2 gap-3">
        {themes.map((themeOption) => (
          <button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`rounded-lg card p-3 text-sm hover:border-primary/40 transition-colors ${
              theme === themeOption.value ? "border-primary" : ""
            }`}
          >
            {themeOption.label}
          </button>
        ))}
      </div>
      <Toggle label="Reduced motion" desc="Disable non-essential animations." />
    </>
  );
}
