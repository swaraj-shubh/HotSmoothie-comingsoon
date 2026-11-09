// Emails need tables and inline styles: most mail apps ignore stylesheets and web fonts.
const CHERRY = "#c8261e"
const INK = "#1c1a19"
const PAGE = "#fff9ef"
const LINEN = "#f2eadb"
const SANS = "'Space Grotesk',Helvetica,Arial,sans-serif"
const MONO = "'Space Mono','Courier New',Courier,monospace"

const STEPS = [
  ["01", "You're in", "Your email is on the Drop 001 waiting list."],
  ["02", "We finish blending", "The croc is still approving the prints. He has opinions."],
  ["03", "First dibs", "The minute the wall opens, you hear it from us first."],
]

export function welcomeEmail({ siteUrl }) {
  const steps = STEPS.map(
    ([n, title, text]) => `
          <tr>
            <td width="44" valign="top" style="padding:14px 0;border-top:1px solid #d8cfbe;font:700 13px ${MONO};color:${CHERRY};">${n}</td>
            <td style="padding:14px 0;border-top:1px solid #d8cfbe;font:400 15px/1.5 ${SANS};color:${INK};"><b>${title}</b><br>${text}</td>
          </tr>`,
  ).join("")

  return {
    subject: "Wall secured. You're on the Drop 001 list.",
    text: `Hey there,

Welcome to The Hot Smoothie Co. You're on the Drop 001 waiting list.

We make posters for people with questionable taste, and you now get first dibs. The minute the wall opens, you hear it from us first.

Good taste is overrated.
The Hot Smoothie Co.

You're getting this because this address joined the waiting list at ${siteUrl}. Changed your mind? Reply with "unsubscribe" and we'll take you off.`,
    html: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>Wall secured</title></head>
<body style="margin:0;padding:0;background:${LINEN};">
<div style="display:none;max-height:0;overflow:hidden;">You've got first dibs on Drop 001. The croc approves.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LINEN};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PAGE};border-radius:16px;overflow:hidden;">
      <tr><td align="center" style="background:${INK};padding:14px 24px;font:400 12px ${MONO};color:#ffffff;">300 GSM Glossy Print &nbsp;·&nbsp; Drop 001</td></tr>
      <tr><td align="center" style="padding:36px 32px 8px;">
        <img src="${siteUrl}/assets/croc-wordmark.png" width="96" alt="The Hot Smoothie Co." style="display:block;width:96px;height:auto;border:0;">
      </td></tr>
      <tr><td style="padding:20px 32px 0;">
        <p style="margin:0 0 12px;font:700 12px ${MONO};letter-spacing:.08em;text-transform:uppercase;color:${CHERRY};">On the list</p>
        <h1 style="margin:0 0 18px;font:500 38px/1.08 ${SANS};letter-spacing:-.02em;color:${CHERRY};">Wall secured.</h1>
        <p style="margin:0 0 12px;font:500 18px/1.4 ${SANS};color:${INK};">Hey there,</p>
        <p style="margin:0 0 24px;font:400 16px/1.55 ${SANS};color:${INK};">Welcome to The Hot Smoothie Co. We make posters for people with questionable taste, and you just got first dibs on Drop 001.</p>
      </td></tr>
      <tr><td style="padding:0 32px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${steps}
        </table>
      </td></tr>
      <tr><td style="padding:16px 32px 36px;font:500 18px/1.4 ${SANS};color:${INK};">Good taste is overrated.<br><span style="color:${CHERRY};">The Hot Smoothie Co.</span></td></tr>
      <tr><td style="background:${INK};padding:20px 32px;font:400 12px/1.6 ${MONO};color:${LINEN};">You're getting this because this address joined the waiting list at <a href="${siteUrl}" style="color:${LINEN};">${siteUrl.replace(/^https?:\/\//, "")}</a>. Changed your mind? Reply with "unsubscribe" and we'll take you off.</td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
  }
}
