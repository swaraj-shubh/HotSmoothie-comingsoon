// Written as a short personal note, not a newsletter: no images, banners, hidden preview text or links.
// Gmail sends designed, link-heavy mail from a new free address to Spam or Promotions; plain notes
// that invite a reply land in the main inbox.
const P = "margin:0 0 16px;"

const LINES = [
  "Hey there,",
  "Thanks for joining the Hot Smoothie Co. waiting list. You're on it.",
  "We're a small poster brand putting the finishing touches on our first collection, Drop 001. You'll hear from us the day it opens, before anyone else.",
  "Quick favour: hit reply and tell us what kind of posters you'd hang on your wall. We read every reply.",
]

export function welcomeEmail({ siteUrl }) {
  const site = siteUrl.replace(/^https?:\/\//, "")
  const footer = `You're getting this because this address joined the waiting list on ${site}. Not you, or changed your mind? Reply "unsubscribe" and we'll remove you.`
  return {
    subject: "You're on the Hot Smoothie Co. list",
    text: `${LINES.join("\n\n")}

Cheers,
The Hot Smoothie Co.

${footer}`,
    html: `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;">
<div style="max-width:560px;padding:16px;font:15px/1.55 Arial,Helvetica,sans-serif;color:#222222;">
${LINES.map((l) => `<p style="${P}">${l}</p>`).join("\n")}
<p style="${P}">Cheers,<br>The Hot Smoothie Co.</p>
<p style="margin:24px 0 0;font-size:12px;color:#777777;">${footer}</p>
</div>
</body>
</html>`,
  }
}
