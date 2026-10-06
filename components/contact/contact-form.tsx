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
        onChange: () => { setErrors(current => ({ ...current, [field.name]: undefined })); setSubmitted(false); },
      };
      return <div key={field.name} className={`min-w-0 ${field.name === "subject" || field.name === "message" ? "sm:col-span-2" : ""}`}><label htmlFor={id} className="mb-2 block text-sm font-semibold">{field.label} <span className="font-normal text-muted">(required)</span></label>{field.name === "message" ? <textarea {...shared} rows={6} /> : <input {...shared} type={field.name === "email" ? "email" : "text"} autoComplete={field.name === "name" ? "name" : field.name === "email" ? "email" : "off"} autoCapitalize={field.name === "email" ? "none" : undefined} />}{error && <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-[#b12f3a]">{error}</p>}</div>;
    })}</div>
    <p id="contact-demo-note" className="text-xs leading-6 text-muted">This is a demo form. Your message stays on this page and will not be sent or saved.</p>
    <button type="submit" className="btn btn-primary w-full sm:w-auto">Send message <span aria-hidden="true">→</span></button>
    <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite">{submitted && <p className="rounded-control border border-[#bddcca] bg-[#edf7f0] p-4 text-sm leading-7 text-[#245443]">Thanks for trying the form. Demo submission complete; no message was sent. You can edit the fields to try again.</p>}</div>
  </form>;
}
