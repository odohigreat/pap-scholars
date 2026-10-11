"use client";

import { useRef, useState, type FormEvent } from "react";

type FieldName = "name" | "email" | "subject" | "message";
const fields: { name: FieldName; label: string; placeholder: string; maxLength: number }[] = [
  { name: "name", label: "Name", placeholder: "Your full name", maxLength: 120 },
  { name: "email", label: "Email", placeholder: "you@example.com", maxLength: 254 },
  { name: "subject", label: "Subject", placeholder: "What would you like to talk about?", maxLength: 180 },
  { name: "message", label: "Message", placeholder: "Tell us a little more…", maxLength: 3000 },
];

export function ContactForm() {
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  const [preview, setPreview] = useState<{ subject: string; message: string } | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nextErrors: Partial<Record<FieldName, string>> = {};
    fields.forEach(field => {
      const input = form.elements.namedItem(field.name) as HTMLInputElement | HTMLTextAreaElement;
      if (!String(data.get(field.name) ?? "").trim()) nextErrors[field.name] = `Please enter your ${field.label.toLowerCase()}.`;
      else if (!input.validity.valid) nextErrors[field.name] = field.name === "email" ? "Please enter a valid email address." : "Please check this field.";
    });
    setErrors(nextErrors);
    const firstError = fields.find(field => nextErrors[field.name]);
    if (firstError) {
      setSubmitted(false);
      (form.elements.namedItem(firstError.name) as HTMLInputElement | HTMLTextAreaElement).focus();
      return;
    }
    // Demo only: no network request, storage, or backend submission.
    setPreview({ subject: String(data.get("subject") ?? "").trim(), message: String(data.get("message") ?? "").trim() });
    setSubmitted(true);
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  return <form noValidate onSubmit={submit} aria-describedby="contact-demo-note" className="space-y-6">
    <div className="grid min-w-0 gap-6 sm:grid-cols-2">{fields.map(field => {
      const id = `contact-${field.name}`;
      const error = errors[field.name];
      const shared = {
        id, name: field.name, required: true, maxLength: field.maxLength,
        placeholder: field.placeholder, "aria-invalid": !!error,
        "aria-describedby": error ? `${id}-error` : undefined,
        className: "contact-input",
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { if (field.name === "message") setMessageLength(event.target.value.length); setErrors(current => ({ ...current, [field.name]: undefined })); setSubmitted(false); },
      };
      return <div key={field.name} className={`min-w-0 ${field.name === "subject" || field.name === "message" ? "sm:col-span-2" : ""}`}><label htmlFor={id} className="mb-2 block text-sm font-semibold">{field.label} <span className="font-normal text-muted">(required)</span></label>{field.name === "message" ? <textarea {...shared} rows={6} /> : <input {...shared} list={field.name === "subject" ? "contact-subjects" : undefined} type={field.name === "email" ? "email" : "text"} autoComplete={field.name === "name" ? "name" : field.name === "email" ? "email" : "off"} autoCapitalize={field.name === "email" ? "none" : undefined} />}{field.name === "message" && <p className="mt-2 text-right text-xs text-muted">{messageLength} / 3000 characters</p>}{error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-[#b12f3a]">{error}</p>}</div>;
    })}</div>
    <datalist id="contact-subjects"><option value="Learning & courses" /><option value="Account & platform" /><option value="Ideas & collaboration" /></datalist>
    <p id="contact-demo-note" className="rounded-control border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-6 text-muted">This is a demo form. Your message stays on this page and will not be sent or saved.</p>
    <button type="submit" className="btn btn-primary min-h-12 w-full">Preview message</button>
    <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite">{submitted && preview && <div className="contact-message-preview"><p className="text-sm font-semibold text-primary">Your message preview</p><h3 className="mt-3 break-words text-lg">{preview.subject}</h3><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted">{preview.message}</p><p className="mt-4 border-t border-border pt-3 text-xs text-muted">Preview only. No message was sent or saved.</p></div>}</div>
  </form>;
}
