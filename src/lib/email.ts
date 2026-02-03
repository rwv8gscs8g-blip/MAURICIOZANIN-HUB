type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "no-reply@mauriciozanin.com";

  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY não configurado. Simulando envio.", {
      to,
      subject,
    });
    return { ok: true, simulated: true };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const result = await resend.emails.send({
    from,
    to,
    subject,
    html,
    text,
  });

  return { ok: true, result };
}
