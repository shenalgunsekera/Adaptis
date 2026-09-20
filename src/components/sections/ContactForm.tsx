"use client";

import { useState, type FormEvent } from "react";

import type { ContactFormSection } from "@/lib/types";

/* ============================================================================
   Contact form — five fields, per the specification.

   The field count is fixed; the labels are editable in the admin panel. The
   subject choice is pre-set from the three entry points above it and sets the
   first field and nothing else.

   Submissions are written to Firestore and a notification is emailed. The
   Firestore write is the record of truth, so a mail failure never loses an
   enquiry — it is stored with the error attached and shown in the inbox.
   ========================================================================= */

type Status = "idle" | "sending" | "ok" | "error";

interface Errors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactForm({ data }: { data: ContactFormSection }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState(data.subjectOptions[0]?.id ?? "");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);

    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      organization: String(fd.get("organization") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      subject: String(fd.get("subject") ?? "").trim(),
      message: String(fd.get("message") ?? "").trim(),
      // Honeypot. A real person never fills this; a bot usually does.
      company_website: String(fd.get("company_website") ?? ""),
    };

    const next: Errors = {};
    if (!payload.name) next.name = "Please tell us your name.";
    if (!payload.email) next.email = "Please give us an address to reply to.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
      next.email = "That address does not look complete.";
    if (!payload.message) next.message = "Please tell us what you are working on.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      const firstInvalid = form.querySelector<HTMLElement>("[aria-invalid='true']");
      firstInvalid?.focus();
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setStatus("error");
        setMessage(
          json.error ??
            "We could not send that just now. Please try again, or write to us directly."
        );
        return;
      }

      setStatus("ok");
      setMessage(data.successMessage);
      form.reset();
      setSubject(data.subjectOptions[0]?.id ?? "");
    } catch {
      setStatus("error");
      setMessage("We could not reach the server. Please try again, or write to us directly.");
    }
  }

  return (
    <section className="section" id="form">
      <div className="wrap">
        {data.eyebrow ? <p className="eyebrow">{data.eyebrow}</p> : null}
        <h2 className="h2">{data.title}</h2>
        {data.intro ? (
          <p className="body secondary" style={{ marginTop: "var(--space-4)" }}>
            {data.intro}
          </p>
        ) : null}

        <form className="form" onSubmit={onSubmit} noValidate style={{ marginTop: "var(--space-7)" }}>
          <div className={`field${errors.name ? " field--error" : ""}`}>
            <label className="field__label" htmlFor="cf-name">
              {data.labels.name}
            </label>
            <input
              id="cf-name"
              name="name"
              autoComplete="name"
              required
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "cf-name-err" : undefined}
            />
            {errors.name ? (
              <p className="field__error" id="cf-name-err">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="cf-org">
              {data.labels.organization}
            </label>
            <input id="cf-org" name="organization" autoComplete="organization" />
          </div>

          <div className={`field${errors.email ? " field--error" : ""}`}>
            <label className="field__label" htmlFor="cf-email">
              {data.labels.email}
            </label>
            <input
              id="cf-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "cf-email-err" : undefined}
            />
            {errors.email ? (
              <p className="field__error" id="cf-email-err">
                {errors.email}
              </p>
            ) : null}
          </div>

          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="field__label" style={{ padding: 0 }}>
              {data.labels.subject}
            </legend>
            <div className="choice" style={{ marginTop: "var(--space-2)" }}>
              {data.subjectOptions.map((opt) => (
                <label key={opt.id}>
                  <input
                    type="radio"
                    name="subject"
                    value={opt.label}
                    checked={subject === opt.id}
                    onChange={() => setSubject(opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className={`field${errors.message ? " field--error" : ""}`}>
            <label className="field__label" htmlFor="cf-message">
              {data.labels.message}
            </label>
            <textarea
              id="cf-message"
              name="message"
              required
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "cf-message-err" : undefined}
            />
            {errors.message ? (
              <p className="field__error" id="cf-message-err">
                {errors.message}
              </p>
            ) : null}
          </div>

          {/* Not shown, not announced, not in the tab order. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="cf-company-website">Company website</label>
            <input id="cf-company-website" name="company_website" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="row" style={{ justifyContent: "space-between" }}>
            <button type="submit" className="btn btn--primary" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : data.submitLabel}
            </button>
            <p className="field__hint" style={{ maxWidth: "38ch" }}>
              {data.privacyNote}
            </p>
          </div>

          <p aria-live="polite" role="status">
            {status === "ok" ? (
              <span className="formnote formnote--ok" style={{ display: "block" }}>
                {message}
              </span>
            ) : status === "error" ? (
              <span className="formnote formnote--err" style={{ display: "block" }}>
                {message}
              </span>
            ) : null}
          </p>
        </form>
      </div>
    </section>
  );
}
