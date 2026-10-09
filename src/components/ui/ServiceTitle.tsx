import { Fragment } from "react";

/**
 * A service name with the word "IT" in gold. The accent marks the offering
 * as an IT practice, the same way SecureAI is marked on the home page.
 * Metadata and schema keep the plain string.
 */
export function ServiceTitle({ title }: { title: string }) {
  const parts = title.split(/(\bIT\b)/);
  if (parts.length === 1) return <>{title}</>;
  return (
    <>
      {parts.map((part, i) =>
        part === "IT" ? (
          <span key={i} className="text-gold">
            IT
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
