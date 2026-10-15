"use client";

import { useRef, useState, type FormEvent } from "react";
import { ProfileAvatar } from "@/features/dashboard/components/profile-avatar";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DashboardProfile({ fullName, learningGoal, email, userId, avatarUrl, onAvatarChange }: { avatarUrl: string | null; fullName: string; learningGoal: string; email: string; userId: string; onAvatarChange: (src: string) => void }) {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "password" | "account">("profile");
  const [firstName, setFirstName] = useState(fullName.trim().split(/\s+/)[0] ?? "");
  const [lastName, setLastName] = useState(fullName.trim().split(/\s+/).slice(1).join(" "));
  const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
  const [avatar, setAvatar] = useState(avatarUrl);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const avatarLock = useRef(false);
  const [goal, setGoal] = useState(learningGoal);
  const [profileStatus, setProfileStatus] = useState("");
  const [profileError, setProfileError] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const inputClass = "profile-input";

  async function selectAvatar(src: string) {
    if (avatarLock.current || src === avatar) return;
    avatarLock.current = true;
    const previous = avatar;
    setAvatar(src);
    setSavingAvatar(true);
    setProfileError(""); setProfileStatus("");
    try {
      const { data, error } = await createClient().from("profiles").update({ avatar_url: src }).eq("id", userId).select("id").single();
      if (error || !data) throw new Error("Unable to save your avatar. Please try again.");
      onAvatarChange(src);
      setProfileStatus("Avatar updated across your dashboard.");
      router.refresh();
    } catch {
      setAvatar(previous);
      setProfileError("Unable to save your avatar. Please try again.");
    } finally {
      avatarLock.current = false;
      setSavingAvatar(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileStatus(""); setProfileError("");
    if (!name.trim() || name.trim().length > 120 || goal.trim().length > 500) {
      setProfileError("Enter a name of up to 120 characters and a learning goal of up to 500 characters.");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await createClient().from("profiles").update({ full_name: name.trim(), learning_goal: goal.trim() }).eq("id", userId).select("id").single();
      if (error || !data) throw new Error("Unable to save your profile. Please try again.");
      setFirstName(firstName.trim()); setLastName(lastName.trim()); setGoal(goal.trim());
      setProfileStatus("Your profile and learning goal have been saved.");
      router.refresh();
    } catch (error) { setProfileError(error instanceof Error ? error.message : "Unable to save your profile."); }
    finally { setSaving(false); }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const currentPassword = String(fields.get("currentPassword") ?? "");
    const password = String(fields.get("password") ?? "");
    setPasswordStatus(""); setPasswordError("");
    if (!currentPassword || password.length < 8 || password !== fields.get("confirmPassword")) {
      setPasswordError("Enter your current password and matching new passwords of at least 8 characters.");
      return;
    }
    if (password === currentPassword) { setPasswordError("Choose a new password different from your current password."); return; }
    setChangingPassword(true);
    try {
      const supabase = createClient();
      const { data: verified, error: verificationError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
      if (verificationError || verified.user?.id !== userId) throw new Error("Your current password could not be verified.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      form.reset();
      setPasswordStatus("Your password has been updated.");
    } catch (error) { setPasswordError(error instanceof Error ? error.message : "Unable to update your password."); }
    finally { setChangingPassword(false); }
  }

  return <div className="profile-workspace">
    <nav className="profile-menu" aria-label="Profile sections">
      {([{ id: "profile", label: "Profile details", icon: "user" }, { id: "password", label: "Password", icon: "lock" }, { id: "account", label: "Account", icon: "shield" }] as const).map(item => <button key={item.id} type="button" aria-current={tab === item.id ? "page" : undefined} onClick={() => setTab(item.id)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d={item.icon === "user" ? "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2" : item.icon === "lock" ? "M6 10h12v11H6z M8 10V7a4 4 0 0 1 8 0v3" : "M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7Z m-5 9 3 3 6-6"} /></svg>{item.label}
      </button>)}
    </nav>
    <section className="profile-content" aria-labelledby="profile-panel-title">
      {tab === "profile" && <>
        <h2 id="profile-panel-title" className="sr-only">Profile details</h2>
        <form onSubmit={saveProfile}>
          <fieldset disabled={saving || savingAvatar} className="disabled:opacity-60">
            <div className="profile-avatar-row">
              <div className="profile-avatar"><ProfileAvatar src={avatar} alt="Your avatar" size={96} /></div>
              <div><h3 className="text-base font-semibold">Your avatar</h3><p className="mt-2 text-sm text-muted">Select a character below. Changes save automatically.</p></div>
            </div>
            <fieldset className="mb-7" aria-busy={savingAvatar}>
              <legend className="sr-only">Avatar options</legend>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {(["male", "female"] as const).flatMap(gender => [1, 2, 3].map(index => {
                  const src = `/images/branding/avatar-${gender}-${index}.svg`;
                  const selected = avatar === src;
                  const label = `${gender === "male" ? "Male" : "Female"} ${index}`;
                  return <label key={src} className={`flex min-w-0 cursor-pointer flex-col items-center gap-2 rounded-xl border p-2 text-xs ${selected ? "border-primary bg-surface-muted text-primary" : "border-border text-muted"}`}>
                    <ProfileAvatar src={src} size={56} alt={`${label} avatar`} className="max-w-full" />
                    <span className="flex flex-wrap items-center justify-center gap-1"><input type="radio" name="illustratedAvatar" value={src} checked={selected} onChange={() => void selectAvatar(src)} className="size-4 accent-primary" />{label}</span>
                  </label>;
                }))}
              </div>
              {savingAvatar && <p role="status" className="mt-3 text-xs text-muted">Saving avatar…</p>}
            </fieldset>
            <div className="profile-fields">
              <label htmlFor="profile-first-name">First name <span aria-hidden="true">*</span><input id="profile-first-name" name="givenName" autoComplete="given-name" required maxLength={120} value={firstName} onChange={event => setFirstName(event.target.value)} className={inputClass} /></label>
              <label htmlFor="profile-last-name">Last name<input id="profile-last-name" name="familyName" autoComplete="family-name" maxLength={120} value={lastName} onChange={event => setLastName(event.target.value)} className={inputClass} /></label>
              <label htmlFor="profile-email">Email address<input id="profile-email" type="email" value={email} readOnly className={inputClass} /></label>
              <label htmlFor="profile-role">Account type<input id="profile-role" value="PAP Scholar · Student" readOnly className={inputClass} /></label>
              <label htmlFor="profile-goal" className="profile-field-wide">Learning goal<textarea id="profile-goal" name="learningGoal" rows={4} maxLength={500} value={goal} onChange={event => setGoal(event.target.value)} aria-describedby="profile-goal-help" placeholder="What would you like to achieve?" className={inputClass} /><span id="profile-goal-help" className="profile-field-hint">Set a goal to guide your learning. {goal.length}/500</span></label>
            </div>
            <button type="submit" className="profile-button profile-save">{saving ? "Saving…" : "Save changes"}</button>
          </fieldset>
          {profileError && <p role="alert" className="profile-feedback text-red-700">{profileError}</p>}
          <p role="status" className="profile-feedback text-[#326e60]">{profileStatus}</p>
        </form>
      </>}
      {tab === "password" && <>
        <h2 id="profile-panel-title" className="text-lg">Password and security</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Confirm your current password to choose a new one.</p>
        <form onSubmit={changePassword} className="mt-7 max-w-md">
          <fieldset disabled={changingPassword} className="profile-fields profile-password-fields disabled:opacity-60">
            <label htmlFor="profile-current-password">Current password<input id="profile-current-password" name="currentPassword" type="password" autoComplete="current-password" required className={inputClass} /></label>
            <label htmlFor="profile-password">New password<input id="profile-password" name="password" type="password" autoComplete="new-password" required minLength={8} aria-describedby="profile-password-help" className={inputClass} /><span id="profile-password-help" className="profile-field-hint">Use at least 8 characters.</span></label>
            <label htmlFor="profile-confirm-password">Confirm new password<input id="profile-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} className={inputClass} /></label>
            <button type="submit" className="profile-button profile-save">{changingPassword ? "Updating…" : "Update password"}</button>
          </fieldset>
          {passwordError && <p role="alert" className="profile-feedback text-red-700">{passwordError}</p>}
          <p role="status" className="profile-feedback text-[#326e60]">{passwordStatus}</p>
        </form>
      </>}
      {tab === "account" && <>
        <h2 id="profile-panel-title" className="text-lg">Your account</h2><p className="mt-2 text-sm leading-6 text-muted">Your personal learning space at PAP Scholars.</p>
        <dl className="profile-account-details"><div><dt>Email address</dt><dd>{email}</dd></div><div><dt>Account type</dt><dd>PAP Scholar · Student</dd></div><div><dt>Learning progress</dt><dd>Your enrollments and completed lessons are saved to your account.</dd></div></dl>
      </>}
    </section>
  </div>;
}
