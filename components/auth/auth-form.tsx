"use client";

import { createClient } from "../../lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type FormEvent } from "react";

type Mode = "login" | "register" | "forgot-password" | "reset-password";
type Field = { name: string; label: string; placeholder: string; type: string; autoComplete: string; hint?: string };
const email: Field = { name: "email", label: "Email address", placeholder: "you@example.com", type: "email", autoComplete: "email" };
const password: Field = { name: "password", label: "Password", placeholder: "Enter your password", type: "password", autoComplete: "current-password" };
const newPassword: Field = { ...password, label: "New password", placeholder: "Create a password", autoComplete: "new-password", hint: "Use at least 8 characters." };
const confirm: Field = { name: "confirmPassword", label: "Confirm password", placeholder: "Re-enter your password", type: "password", autoComplete: "new-password" };
const screens = {
  login: { eyebrow: "YOUR NEXT CHAPTER", title: "Welcome back", description: "Sign in to continue your learning journey.", button: "Log in", loading: "Loading…", fields: [email, password] },
  register: { eyebrow: "START SOMETHING GREAT", title: "Create your account", description: "Make room for growth. Your journey starts here.", button: "Create account", loading: "Loading…", fields: [{ name: "fullName", label: "Full name", placeholder: "Enter your full name", type: "text", autoComplete: "name" }, email, { ...newPassword, label: "Password" }, confirm] },
  "forgot-password": { eyebrow: "LET’S GET YOU BACK", title: "Forgot your password?", description: "Enter your email and we’ll help you get back to learning with a password reset link.", button: "Send reset link", loading: "Loading…", fields: [email] },
  "reset-password": { eyebrow: "A FRESH START", title: "Set a new password", description: "Choose a new password to keep your account secure.", button: "Update password", loading: "Loading…", fields: [newPassword, { ...confirm, label: "Confirm new password" }] },
} satisfies Record<Mode, { eyebrow: string; title: string; description: string; button: string; loading: string; fields: Field[] }>;

function Eye({ visible }: { visible: boolean }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" />{visible && <path d="m3 3 18 18" />}</svg>;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const screen = screens[mode];
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [authError, setAuthError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: Record<string, string> = {};
    screen.fields.forEach(field => {
      const value = String(data.get(field.name) || "");
      if (!value.trim()) nextErrors[field.name] = `Please enter your ${field.label.toLowerCase()}.`;
      else if (field.type === "email" && !(form.elements.namedItem(field.name) as HTMLInputElement).validity.valid) nextErrors[field.name] = "Please enter a valid email address.";
      else if (field.name === "password" && mode !== "login" && value.length < 8) nextErrors[field.name] = "Use at least 8 characters for your password.";
      else if (field.name === "confirmPassword" && value !== data.get("password")) nextErrors[field.name] = "Your passwords don’t match. Please try again.";
    });
    setAuthError("");
    setErrors(nextErrors);
    setNotice("");
    const firstError = Object.keys(nextErrors)[0];
    if (firstError) { (form.elements.namedItem(firstError) as HTMLInputElement)?.focus(); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const emailValue = String(data.get("email") ?? "").trim();
      const passwordValue = String(data.get("password") ?? "");
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: emailValue, password: passwordValue });
        if (error) throw error;
        const requestedNext = new URLSearchParams(window.location.search).get("next");
        const destination = requestedNext ? new URL(requestedNext, window.location.origin) : null;
        router.replace(destination?.origin === window.location.origin && destination.pathname.startsWith("/courses/") ? destination.pathname : "/dashboard");
        router.refresh();
      } else if (mode === "register") {
        const fullName = String(data.get("fullName") ?? "").trim();
        if (fullName.length > 120) throw new Error("Use no more than 120 characters for your name.");
        const { data: result, error } = await supabase.auth.signUp({
          email: emailValue, password: passwordValue,
          options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (result.session) {
          router.replace("/dashboard");
          router.refresh();
        } else {
          setNotice("Check your email to confirm your account before logging in.");
          form.reset();
        }
      } else if (mode === "forgot-password") {
        const { error } = await supabase.auth.resetPasswordForEmail(emailValue, { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
        if (error) throw error;
        setNotice("If an account exists for this email, you’ll receive a password reset link.");
      } else {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("Open the password reset link from your email before setting a new password.");
        const { error } = await supabase.auth.updateUser({ password: passwordValue });
        if (error) throw error;
        setNotice("Your password has been updated. You can continue to your dashboard.");
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div className="w-full max-w-[27rem]" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="mb-8">
        <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-primary"><span aria-hidden="true" className="size-1.5 rounded-full bg-[#326e60]" />{screen.eyebrow}</div>
        <h1 className="editorial-title text-[clamp(2.2rem,4vw,3rem)] leading-tight">{screen.title}</h1>
        <p className="mt-3 text-[0.9375rem] leading-7 text-muted">{screen.description}</p>
      </div>
      <form noValidate onSubmit={submit} aria-busy={loading} className="space-y-5">
        {screen.fields.map((field: Field) => {
          const error = errors[field.name];
          const id = `${mode}-${field.name}`;
          return <div key={field.name}>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold">{field.label}</label>
            <div className="relative">
              <input id={id} name={field.name} type={field.type === "password" && shown[field.name] ? "text" : field.type} autoComplete={field.autoComplete} placeholder={field.placeholder} required disabled={loading} spellCheck={field.type === "text"} autoCapitalize={field.type === "email" ? "none" : undefined} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : field.hint ? `${id}-hint` : undefined} onChange={() => { setErrors(previous => ({ ...previous, [field.name]: "" })); setNotice(""); }} className={`auth-input ${field.type === "password" ? "pr-14" : ""}`} />
              {field.type === "password" && <button type="button" disabled={loading} onClick={() => setShown(previous => ({ ...previous, [field.name]: !previous[field.name] }))} aria-label={`${shown[field.name] ? "Hide" : "Show"} ${field.label.toLowerCase()}`} aria-pressed={!!shown[field.name]} className="absolute inset-y-1 right-1 flex w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-primary"><Eye visible={!!shown[field.name]} /></button>}
            </div>
            {field.hint && !error && <p id={`${id}-hint`} className="mt-2 text-xs text-muted">{field.hint}</p>}
            {error && <p id={`${id}-error`} role="alert" className="mt-2 text-xs font-medium text-[#b12f3a]">{error}</p>}
          </div>;
        })}
        {mode === "login" && <div className="flex justify-end text-sm"><Link href="/forgot-password" className="auth-link inline-flex min-h-11 items-center">Forgot password?</Link></div>}
        {authError && <p role="alert" className="text-sm text-[#b12f3a]">{authError}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary min-h-[3.25rem] w-full shadow-[0_4px_12px_rgba(36,86,166,0.15)]">
          {loading && <svg className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" /><path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>}
          {loading ? screen.loading : screen.button}
        </button>
        <AnimatePresence>{notice && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : 0.15 }} role="status" className="rounded-control border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-primary">{notice}</motion.div>}</AnimatePresence>
      </form>
      <div className="mt-7 border-t border-border pt-6 text-sm text-muted">
        {mode === "login" ? <>New to PAP Scholars? <Link href="/register" className="auth-link">Create an account</Link></> : mode === "register" ? <>Already have an account? <Link href="/login" className="auth-link">Log in</Link></> : <Link href="/login" className="auth-link inline-flex min-h-11 items-center gap-2"> Back to login</Link>}
      </div>
    </motion.div>
  );
}
