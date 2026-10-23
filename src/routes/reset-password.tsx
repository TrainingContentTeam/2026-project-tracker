import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [
    { title: "Reset password — 2026 Course Tracker" },
    { name: "description", content: "Choose a new password for your 2026 Course Tracker account." },
    { property: "og:title", content: "Reset password — 2026 Course Tracker" },
    { property: "og:description", content: "Secure account recovery for the 2026 Course Tracker." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
});

function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const recoveryLink = new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery";
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (active && event === "PASSWORD_RECOVERY") {
        setReady(true);
        setChecking(false);
      }
    });
    supabase.auth.getUser().then(({ data: userData, error: authError }) => {
      if (!active) return;
      if (recoveryLink && userData.user && !authError) setReady(true);
      setChecking(false);
    }).catch(() => { if (active) setChecking(false); });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!ready || submitting) return;
    if (password !== confirmation) { setError("Passwords do not match."); return; }
    setSubmitting(true);
    setError("");
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.code === "weak_password" ? "Choose a stronger password and try again." : "Unable to change your password. Request a fresh reset link and try again.");
        return;
      }
      setSaved(true);
      setPassword("");
      setConfirmation("");
    } catch { setError("Unable to connect. Please try again."); }
    finally { setSubmitting(false); }
  }

  return <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
    <Card className="w-full max-w-sm p-6">
      <h1 className="text-xl font-semibold text-foreground">Reset password</h1>
      {checking ? <p className="mt-4 text-sm text-muted-foreground">Checking reset link…</p> : saved ? <>
        <p role="status" className="mt-4 text-sm text-foreground">Your password has been updated.</p>
        <Button asChild className="mt-4 w-full"><Link to="/">Open tracker</Link></Button>
      </> : !ready ? <>
        <p role="alert" className="mt-4 text-sm text-muted-foreground">This reset link is missing or expired. Request a new one.</p>
        <Button asChild className="mt-4 w-full"><Link to="/login">Back to sign in</Link></Button>
      </> : <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type="password" autoComplete="new-password" required value={confirmation} onChange={e => setConfirmation(e.target.value)} /></div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Saving…" : "Save password"}</Button>
      </form>}
    </Card>
  </div>;
}