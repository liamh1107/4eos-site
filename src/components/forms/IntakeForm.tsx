"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { setResolve } from "@/components/signal/store";

type Fields = {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  company_url: string;
};

const EMPTY: Fields = {
  name: "",
  email: "",
  company: "",
  phone: "",
  message: "",
  company_url: "",
};

const REQUIRED: (keyof Fields)[] = ["name", "email", "message"];

export function IntakeForm({
  endpoint,
  intent,
  submitLabel = "Send",
  topic,
  detail,
  messageLabel,
}: {
  endpoint: "/api/contact" | "/api/support";
  intent: "assessment" | "support";
  submitLabel?: string;
  /** Short context that is prepended to the ticket, such as a quiz result. */
  topic?: string;
  /** Lead source recorded in analytics. Defaults to the intent. */
  detail?: "quiz";
  messageLabel?: string;
}) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [ticketId, setTicketId] = useState<string | null>(null);

  const complete = useMemo(() => {
    const filled = REQUIRED.filter((k) => fields[k].trim().length > 0).length;
    return filled / REQUIRED.length;
  }, [fields]);

  function update(key: keyof Fields, value: string) {
    const next = { ...fields, [key]: value };
    setFields(next);
    const filled = REQUIRED.filter((k) => next[k].trim().length > 0).length;
    setResolve(filled / REQUIRED.length);
  }

  const valid =
    fields.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email) &&
    fields.message.trim().length > 8;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setStatus("sending");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, intent, ...(topic ? { topic } : {}), ...(detail ? { detail } : {}) }),
      });
      if (!res.ok) throw new Error("send failed");
      const data = (await res.json().catch(() => null)) as { ticketId?: unknown } | null;
      setTicketId(typeof data?.ticketId === "string" ? data.ticketId : null);
      setStatus("sent");
      setResolve(1);
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <p className="lede" role="status">
        Received.{ticketId ? ` Ticket ${ticketId}.` : ""} We will follow up within one business day.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <Field
        label="Name"
        name="name"
        value={fields.name}
        onChange={(v) => update("name", v)}
        required
      />
      <Field
        label="Email"
        name="email"
        type="email"
        value={fields.email}
        onChange={(v) => update("email", v)}
        required
      />
      <Field
        label="Company"
        name="company"
        value={fields.company}
        onChange={(v) => update("company", v)}
      />
      <Field
        label="Phone"
        name="phone"
        type="tel"
        value={fields.phone}
        onChange={(v) => update("phone", v)}
      />
      <Field
        label={messageLabel ?? (intent === "support" ? "What is happening" : "What should we know")}
        name="message"
        value={fields.message}
        onChange={(v) => update("message", v)}
        multiline
        required
      />
      {/* Honeypot. Hidden from people, filled by most bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company website
          <input
            name="company_url"
            tabIndex={-1}
            autoComplete="off"
            value={fields.company_url}
            onChange={(e) => update("company_url", e.target.value)}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={!valid || status === "sending"}
        className="micro mt-4 flex h-14 w-full items-center justify-center bg-ink text-bone transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
      >
        {status === "sending" ? "Sending" : `→ ${submitLabel}`}
      </button>
      <p className="body-sm text-fg-faint">
        Sending this opens a ticket with {intent === "assessment" ? "sales" : "the help desk"} so we can reply. We do not sell what you type.{" "}
        <Link href="/privacy" className="underline decoration-hairline-strong underline-offset-4 hover:text-gold">
          Privacy
        </Link>
        {" · "}
        <Link href="/terms" className="underline decoration-hairline-strong underline-offset-4 hover:text-gold">
          Terms
        </Link>
      </p>
      {status === "error" ? (
        <p className="body-sm" role="alert">
          The message did not go through. Call {`(260) 490-7740`} or try again.
        </p>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {Math.round(complete * 100)} percent complete
      </span>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  multiline = false,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  required?: boolean;
}) {
  const shared = {
    id: name,
    name,
    value,
    required,
    placeholder: label,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(e.target.value),
    onFocus: () => setResolve(Math.max(0.08, value ? 0.4 : 0.15)),
    className:
      "peer h-14 w-full rounded-[4px] border border-hairline-strong bg-bone/14 px-4 text-[15px] tracking-tight text-fg placeholder:text-fg-faint focus:border-gold focus:outline-none",
  };

  return (
    <div>
      <label htmlFor={name} className="sr-only">
        {label}
        {required ? " (required)" : ""}
      </label>
      {multiline ? (
        <textarea {...shared} className={`${shared.className} h-36 py-4`} />
      ) : (
        <input {...shared} type={type} autoComplete={name} />
      )}
    </div>
  );
}
