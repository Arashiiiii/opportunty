/** Small plain-text notification mails (new application, job awaiting approval…) through Resend. Never throws. */
export async function notify(to: string | string[], subject: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "opportunty. <no-reply@contact.opportunty.com>",
        to: Array.isArray(to) ? to : [to], subject, text,
      }),
    });
    if (!res.ok) console.error("notify rejected:", res.status, await res.text().catch(() => ""));
  } catch (err) { console.error("notify failed:", err); }
}
