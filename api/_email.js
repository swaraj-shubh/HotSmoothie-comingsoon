// Light brand styling only: colours and type, no images, links, banners or hidden preview text.
// Image- and link-heavy mail from a new free Gmail address goes to Spam or Promotions; mostly-text
// notes that invite a reply land in the main inbox. Tables + inline styles: mail apps ignore stylesheets.
const CHERRY = "#c8261e"
const INK = "#1c1a19"
const CREAM = "#fff9ef"
const LINEN = "#f2eadb"
const SANS = "Helvetica,Arial,sans-serif"
const MONO = "'Courier New',Courier,monospace"

const INTRO = "Thanks for joining the Hot Smoothie Co. waiting list. You're on it."
const BODY = "We're a small poster brand putting the finishing touches on our first collection, Drop 001. You'll hear from us the day it opens, before anyone else."
const ASK = "Hit reply and tell us what kind of posters you'd hang on your wall. We read every reply."

export function welcomeEmail({ siteUrl }) {
  const site = siteUrl.replace(/^https?:\/\/|\/$/g, "")
  const footer = `You're getting this because this address joined the waiting list on ${site}. Not you, or changed your mind? Reply "unsubscribe" and we'll remove you.`
  const p = (t, extra = "") => `<p style="margin:0 0 16px;font:16px/1.6 ${SANS};color:${INK};${extra}">${t}</p>`
  return {
    subject: "You're on the Hot Smoothie Co. list",
    text: `Hey there,

${INTRO}

${BODY}

Quick favour: ${ASK}

Cheers,
The Hot Smoothie Co.

${footer}`,
    html: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;padding:0;background:${LINEN};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LINEN};">
  <tr><td align="center" style="padding:28px 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:${CREAM};border-top:5px solid ${CHERRY};border-radius:14px;">
      <tr><td style="padding:28px 28px 8px;">
        <p style="margin:0 0 22px;font:700 12px ${MONO};letter-spacing:2px;text-transform:uppercase;color:${CHERRY};">The Hot Smoothie Co. &middot; Drop 001</p>
        <h1 style="margin:0 0 20px;font:700 30px/1.15 ${SANS};letter-spacing:-0.5px;color:${INK};">You're on the list.</h1>
        ${p("Hey there,")}
        ${p(INTRO)}
        ${p(BODY, "margin-bottom:22px;")}
      </td></tr>
      <tr><td style="padding:0 28px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LINEN};border-left:4px solid ${CHERRY};border-radius:8px;">
          <tr><td style="padding:16px 18px;font:15px/1.55 ${SANS};color:${INK};"><b style="color:${CHERRY};">Quick favour</b><br>${ASK}</td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:24px 28px 28px;font:16px/1.5 ${SANS};color:${INK};">Cheers,<br><b style="color:${CHERRY};">The Hot Smoothie Co.</b></td></tr>
    </table>
    <p style="max-width:500px;margin:18px auto 0;font:12px/1.5 ${SANS};color:#7a7064;text-align:center;">${footer}</p>
  </td></tr>
</table>
</body>
</html>`,
  }
}
