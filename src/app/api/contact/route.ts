import { NextResponse } from "next/server";
import { Resend } from "resend";
import { recordFormLead } from "@/lib/analytics/ingest";
import { postRewstTicket, rewstWebhookUrl } from "@/lib/rewst";
import { salesEmail } from "@/lib/content";
import { site } from "@/lib/site";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type Payload = {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  message?: string;
  company_url?: string;
  topic?: string;
  intent?: "assessment" | "support";
  /** "quiz" when the request came from the risk quiz result card. */
  detail?: string;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Honeypot: bots fill this, people never see it.
  if (body.company_url) return NextResponse.json({ ok: true });

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  if (name.length < 2 || !email.includes("@") || message.length < 8) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const support = body.intent === "support";
  const intent = support ? "Support" : "Assessment";
  const to = support ? (process.env.INTAKE_TO ?? site.helpdesk) : salesEmail;
  const from = process.env.INTAKE_FROM ?? "4EOS Website <onboarding@resend.dev>";

  const text = [
    `${intent} from ${name}`,
    `Email: ${email}`,
    body.company ? `Company: ${body.company}` : null,
    body.phone ? `Phone: ${body.phone}` : null,
    body.topic ? `Topic: ${String(body.topic).slice(0, 80)}` : null,
    "",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  const company = body.company?.trim() || undefined;
  const phone = body.phone?.trim() || undefined;
  const rewst = rewstWebhookUrl() !== null;
  let ticketOk = !rewst;
  let ticketId: string | null = null;
  if (rewst) {
    try {
      const ticket = await postRewstTicket({
        intent,
        name,
        email,
        company,
        phone,
        message: body.topic ? `[${String(body.topic).slice(0, 80)}] ${message}` : message,
      });
      ticketOk = ticket.ok;
      ticketId = ticket.ticketId;
    } catch (error) {
      console.error("[rewst]", error);
      ticketOk = false;
    }
  }

  let emailOk = !resend;
  if (resend) {
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `${intent}: ${name}`,
      text,
    });
    emailOk = !error;
    if (error) console.error(error);
  }

  if (!rewst && !resend) {
    console.log("[intake]", text);
    return NextResponse.json({ ok: true });
  }
  if (rewst && !ticketOk) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  if (!rewst && !emailOk) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  try {
    const kind = support ? "support" : body.detail === "quiz" ? "quiz" : "assessment";
    recordFormLead(kind, request.headers.get("cookie"));
  } catch (error) {
    console.error("[signal]", error);
  }

  return NextResponse.json({ ok: true, ...(ticketId ? { ticketId } : {}) });
}
