"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LoginError = "refused" | "unconfigured" | "network";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<LoginError | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/analytics/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: data.get("user"), password: data.get("password") }),
      });
      const body = (await res.json().catch(() => null)) as { reason?: string } | null;
      if (!res.ok) {
        setPending(false);
        setError(body?.reason === "unconfigured" ? "unconfigured" : "refused");
        return;
      }
      router.push("/analytics");
      router.refresh();
    } catch {
      setPending(false);
      setError("network");
    }
  }

  const message =
    error === "unconfigured"
      ? "The server has no ANALYTICS_USER or ANALYTICS_PASSWORD. Add both to .env and restart."
      : error === "refused"
        ? "That sign-in was refused. The username must match ANALYTICS_USER exactly."
        : error === "network"
          ? "The sign-in request did not complete. Check the connection and try again."
          : null;

  return (
    <form onSubmit={onSubmit} className="command-login" aria-busy={pending || undefined}>
      <p className="command-kicker">4EOS analytics</p>
      <h1>Sign in</h1>
      <label htmlFor="analytics-user">
        Username
        <input
          id="analytics-user"
          name="user"
          autoComplete="username"
          required
          disabled={pending}
          aria-invalid={error === "refused" || undefined}
          aria-describedby={message ? "analytics-login-error" : undefined}
        />
      </label>
      <label htmlFor="analytics-password">
        Password
        <input
          id="analytics-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          aria-invalid={error === "refused" || undefined}
          aria-describedby={message ? "analytics-login-error" : undefined}
        />
      </label>
      {message ? (
        <p id="analytics-login-error" className="command-empty" role="alert">
          {message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} data-state={pending ? "loading" : error ? "error" : undefined}>
        {pending ? "Checking" : "Enter"}
      </button>
    </form>
  );
}
