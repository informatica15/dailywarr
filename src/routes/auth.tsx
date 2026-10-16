import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Cloud, LogOut } from "lucide-react";
import "@lovable.dev/cloud-auth-js/styles.css";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useGame } from "@/lib/game/store";
import { PageHeader, Panel, btnGhost, btnPrimary } from "@/components/game/ui";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Account — The Daily War" },
      { name: "description", content: "Sign in to save your quests, XP and progress across all your devices." },
      { property: "og:title", content: "Account — The Daily War" },
      { property: "og:description", content: "Sign in to keep your progress on every device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const input = "w-full rounded-lg border border-border bg-raised px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function AuthPage() {
  const { user, sync, signOut } = useGame();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (user) {
    return (
      <div className="mx-auto max-w-md">
        <PageHeader eyebrow="Account" title="You're signed in" description="Your progress is saved to your account and follows you to any device." />
        <Panel>
          <div className="space-y-4 text-sm">
            <p>Signed in as <span className="font-medium">{user.email}</span></p>
            <p className="flex items-center gap-2 text-muted-foreground"><Cloud className="h-4 w-4" />
              {sync === "synced" ? "All progress saved" : sync === "syncing" ? "Saving…" : sync === "error" ? "Could not reach the save — will retry on your next change" : "Connecting…"}</p>
            <button className={btnGhost} onClick={async () => { await signOut(); toast("Signed out. This device keeps a local copy."); }}><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        </Panel>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      if (mode === "up") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        if (!data.session) setSent(true); else navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) { toast.error(err instanceof Error ? err.message : "Something went wrong"); }
    finally { setBusy(false); }
  };
  const social = async (p: "google" | "lovable") => {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    if (r.error) { toast.error("Sign-in failed. Please try again."); return; }
    if (!r.redirected) navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-md">
      <PageHeader eyebrow="Account" title={mode === "in" ? "Sign in" : "Create your account"} description="Save your quests, XP and arena progress, and continue on any device. Progress on this device is kept when you first sign in." />
      <Panel>
        {sent ? (
          <p className="text-sm">Check <span className="font-medium">{email}</span> for a confirmation link, then come back and sign in.</p>
        ) : (
          <div className="space-y-4">
            <button type="button" className={`${btnGhost} w-full justify-center`} onClick={() => social("google")}>Continue with Google</button>
            <button type="button" className="lovable-auth-button w-full" onClick={() => social("lovable")}>Continue with Lovable</button>
            <div className="text-center text-xs text-muted-foreground">or with email</div>
            <form onSubmit={submit} className="space-y-3">
              <input className={input} type="email" required placeholder="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className={input} type="password" required minLength={6} placeholder="Password" autoComplete={mode === "in" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className={`${btnPrimary} w-full justify-center`} disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</button>
            </form>
            <button type="button" className="w-full text-center text-sm text-magic hover:underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
              {mode === "in" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
}
