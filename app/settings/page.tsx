"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/lib/auth";
import { NxpsLogo } from "@/components/Brand";
import { IconArrow, IconCheck } from "@/components/icons";

type Tab = "general" | "notifications" | "integrations" | "security";

const TABS: { id: Tab; label: string }[] = [
  { id: "general", label: "General" },
  { id: "notifications", label: "Notifications" },
  { id: "integrations", label: "Integrations" },
  { id: "security", label: "Security" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("general");
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace("/login"); return; }
    setUser({ name: s.name, email: s.email });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass border-b border-line px-6 lg:px-10 h-[64px] flex items-center gap-6">
        <button onClick={() => router.push("/")} className="text-muted hover:text-ink transition">
          &larr; Hub
        </button>
        <NxpsLogo compact />
        <span className="text-[13px] text-muted">/ Settings</span>
      </header>

      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-10 gap-10">
        <nav className="w-44 shrink-0 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] transition ${
                tab === t.id
                  ? "bg-gold/10 text-gold-bright font-medium"
                  : "text-muted hover:text-ink-soft hover:bg-white/[0.03]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 min-w-0">
          {tab === "general"       && <GeneralTab user={user} />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "integrations"  && <IntegrationsTab />}
          {tab === "security"      && <SecurityTab email={user?.email ?? ""} />}
        </div>
      </div>
    </div>
  );
}

/* ── General ─────────────────────────────────────────────────── */
const GENERAL_KEY = "nxps_general_prefs";

function GeneralTab({ user }: { user: { name: string; email: string } | null }) {
  const [timezone, setTimezone]     = useState("Europe/London");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [saved, setSaved]           = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(GENERAL_KEY);
      if (stored) {
        const p = JSON.parse(stored);
        if (p.timezone)   setTimezone(p.timezone);
        if (p.dateFormat) setDateFormat(p.dateFormat);
      }
    } catch {}
  }, []);

  const save = () => {
    try {
      localStorage.setItem(GENERAL_KEY, JSON.stringify({ timezone, dateFormat }));
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Section title="General" desc="Appearance and regional preferences.">
      <Field label="Name"  value={user?.name  ?? ""} disabled />
      <Field label="Email" value={user?.email ?? ""} disabled hint="Managed by your identity provider." />
      <SelectField
        label="Timezone" value={timezone} onChange={setTimezone}
        options={["Europe/London", "Europe/Dublin", "UTC", "America/New_York"]}
      />
      <SelectField
        label="Date format" value={dateFormat} onChange={setDateFormat}
        options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
      />
      <div className="pt-2">
        <label className="flex items-center gap-3 text-[13px] text-muted cursor-not-allowed select-none">
          <span className="grid place-items-center w-[18px] h-[18px] rounded-[6px] bg-gold border-gold border text-[#0a0a0c]">
            <IconCheck width={12} height={12} />
          </span>
          Dark mode — always on (premium NXPS theme)
        </label>
      </div>
      <SaveButton onSave={save} saved={saved} />
    </Section>
  );
}

/* ── Notifications ────────────────────────────────────────────── */
const NOTIF_KEY = "nxps_notif_prefs";

const NOTIF_DEFAULTS = {
  newLead:      true,
  wonDeal:      true,
  taskReminder: true,
  weeklyReport: false,
  loginAlert:   true,
};

type NotifPrefs = typeof NOTIF_DEFAULTS;

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotifPrefs>(NOTIF_DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      if (stored) setPrefs({ ...NOTIF_DEFAULTS, ...JSON.parse(stored) });
    } catch {}
  }, []);

  const toggle = (k: keyof NotifPrefs) =>
    setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const save = () => {
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs)); } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Section title="Notifications" desc="Control what you get notified about.">
      <div className="card divide-y divide-line">
        {(
          [
            ["newLead",      "New lead received",           "Triggered when a new contact is created in GHL"],
            ["wonDeal",      "Deal won",                    "When an opportunity is moved to Won in GHL"],
            ["taskReminder", "Task / appointment reminders","Calendar events and tasks due today"],
            ["weeklyReport", "Weekly performance report",   "Summary of KPIs every Monday morning"],
            ["loginAlert",   "Sign-in alerts",              "Notify when a new session is started"],
          ] as [keyof NotifPrefs, string, string][]
        ).map(([key, label, sub]) => (
          <div key={key} className="flex items-center justify-between px-4 py-3.5">
            <div>
              <p className="text-[13.5px] text-ink-soft">{label}</p>
              <p className="text-[11.5px] text-muted mt-0.5">{sub}</p>
            </div>
            <Toggle on={prefs[key]} onToggle={() => toggle(key)} />
          </div>
        ))}
      </div>
      <SaveButton onSave={save} saved={saved} />
    </Section>
  );
}

/* ── Integrations ─────────────────────────────────────────────── */
interface IntegrationStatus {
  ghl: { configured: boolean; bgr: boolean; bcf: boolean; group: boolean };
  ceo: { configured: boolean };
}

function IntegrationsTab() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  const ghlOk  = status?.ghl.configured ?? false;
  const bgrOk  = status?.ghl.bgr        ?? false;
  const bcfOk  = status?.ghl.bcf        ?? false;
  const ceoOk  = status?.ceo.configured ?? false;

  return (
    <Section title="Integrations" desc="Connect external platforms to power live data.">
      {/* GHL */}
      <div className="card px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[14px] font-semibold text-ink">GoHighLevel</p>
            <p className="text-[12.5px] text-muted mt-0.5">
              Powers live KPI data: Total Leads, Pipeline Value, Won This Month, Tasks Due.
            </p>
          </div>
          {status === null ? (
            <span className="chip bg-line text-faint shrink-0">Checking…</span>
          ) : ghlOk ? (
            <span className="chip bg-pos/12 text-pos shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-pos" /> Connected
            </span>
          ) : (
            <span className="chip bg-warn/12 text-warn shrink-0">Not connected</span>
          )}
        </div>

        {ghlOk ? (
          <div className="mt-4 space-y-2">
            <p className="text-[12px] text-muted mb-2">Location IDs configured:</p>
            <LocationRow label="BGR (Bespoke Garden Rooms)" ok={bgrOk} />
            <LocationRow label="BCF (Ballycastle Climbing Frames)" ok={bcfOk} />
            <LocationRow label="Group (NXPS Group)" ok={status?.ghl.group ?? false} optional />
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <SetupStep n={1} text="GHL → Settings → Integrations → Private Integrations → Create" />
            <SetupStep n={2} text="Enable scopes: contacts.readonly, opportunities.readonly, calendars.readonly" />
            <SetupStep n={3} text="Copy the Agency-level token value" />
            <SetupStep n={4} text="Create .env.local in the project root (see .env.local.example)" />
            <SetupStep n={5} text="Add GHL_API_KEY=your_token and the location IDs" />
            <SetupStep n={6} text="Restart the dev server — KPIs will update automatically" />
            <div className="mt-3 p-3 rounded-xl bg-surface-2 border border-line">
              <p className="text-[11.5px] font-mono text-muted">
                GHL_API_KEY=<span className="text-faint">your_token</span><br />
                GHL_BGR_LOCATION_ID=<span className="text-faint">loc_xxx</span><br />
                GHL_BCF_LOCATION_ID=<span className="text-faint">loc_xxx</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CEO Dashboard */}
      <div className="card px-5 py-5 mt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[14px] font-semibold text-ink">CEO Dashboard</p>
            <p className="text-[12.5px] text-muted mt-0.5">
              Powers appointment data and business overview metrics.
            </p>
          </div>
          {status === null ? (
            <span className="chip bg-line text-faint shrink-0">Checking…</span>
          ) : ceoOk ? (
            <span className="chip bg-pos/12 text-pos shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-pos" /> Connected
            </span>
          ) : (
            <span className="chip bg-warn/12 text-warn shrink-0">Not connected</span>
          )}
        </div>
      </div>

      {/* Future integrations */}
      <div className="space-y-3 mt-4">
        {[
          ["Stripe",            "Billing, invoices and payment tracking"],
          ["Google Workspace",  "Calendar sync and Drive documents"],
          ["Mailchimp",         "Email campaign metrics"],
          ["ClickUp",           "Project management and task sync"],
        ].map(([name, desc]) => (
          <div key={name} className="card px-4 py-3.5 flex items-center justify-between opacity-60">
            <div>
              <p className="text-[13.5px] text-ink-soft">{name}</p>
              <p className="text-[12px] text-muted">{desc}</p>
            </div>
            <span className="chip bg-line text-faint">Coming soon</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ── Security ─────────────────────────────────────────────────── */
function SecurityTab({ email }: { email: string }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    signOut();
    router.push("/login");
  };

  return (
    <Section title="Security" desc="Manage authentication and session settings.">
      <div className="card divide-y divide-line">
        <div className="px-4 py-3.5">
          <p className="text-[13.5px] text-ink-soft">Multi-Factor Authentication</p>
          <p className="text-[12px] text-muted mt-0.5">MFA is handled by your identity provider (Google / GHL).</p>
        </div>
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-[13.5px] text-ink-soft">Active session</p>
            <p className="text-[12px] text-muted mt-0.5">{email}</p>
          </div>
          <span className="chip bg-pos/12 text-pos flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pos" /> Active
          </span>
        </div>
        <div className="px-4 py-3.5">
          <p className="text-[13.5px] text-ink-soft">Password</p>
          <p className="text-[12px] text-muted mt-0.5">Password management is handled by your SSO provider.</p>
        </div>
      </div>

      <div className="card px-4 py-4 mt-4 border-neg/20">
        <p className="text-[13px] font-semibold text-ink mb-1">Danger zone</p>
        <p className="text-[12px] text-muted mb-3">
          Signing out will end your current Hub session.
        </p>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-neg/30 bg-neg/8 px-4 py-2.5 text-[13px] font-medium text-neg hover:bg-neg/15 transition"
        >
          Sign out of NXPS Hub
        </button>
      </div>
    </Section>
  );
}

/* ── Shared components ─────────────────────────────────────────── */
function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
      <p className="text-[13px] text-muted mt-1 mb-6">{desc}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, value, disabled, hint }: { label: string; value: string; disabled?: boolean; hint?: string }) {
  return (
    <label className="block">
      <span className="text-[12.5px] text-ink-soft block mb-1.5">{label}</span>
      <input
        defaultValue={value}
        disabled={disabled}
        className={`field-input ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
      {hint && <p className="text-[11.5px] text-faint mt-1">{hint}</p>}
    </label>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[12.5px] text-ink-soft block mb-1.5">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
        style={{ appearance: "auto" }}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-gold" : "bg-line-strong"}`}
    >
      <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function SaveButton({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <button onClick={onSave} className={`btn-gold ${saved ? "opacity-80" : ""}`}>
      {saved ? "✓ Saved" : <><span>Save changes</span> <IconArrow width={15} height={15} /></>}
    </button>
  );
}

function SetupStep({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="grid place-items-center w-5 h-5 rounded-full bg-gold/15 text-gold text-[11px] font-bold shrink-0 mt-0.5">{n}</span>
      <span className="text-[12.5px] text-ink-soft">{text}</span>
    </div>
  );
}

function LocationRow({ label, ok, optional }: { label: string; ok: boolean; optional?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[12.5px] text-ink-soft">{label}{optional ? " (optional)" : ""}</span>
      {ok ? (
        <span className="text-[11.5px] text-pos flex items-center gap-1">
          <IconCheck width={12} height={12} /> Set
        </span>
      ) : (
        <span className="text-[11.5px] text-faint">{optional ? "Not set" : "Missing"}</span>
      )}
    </div>
  );
}
