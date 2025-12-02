import { Resend } from "resend";
import { config } from "dotenv";

config()

const resend = new Resend(process.env.EMAIL_API_KEY);

export async function sendEmail(subject, html, to) {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: to,
    subject: subject,
    html: html
  });
}
