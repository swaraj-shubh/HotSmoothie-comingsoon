import { createHmac } from "node:crypto"

import nodemailer from "nodemailer"
import pg from "pg"

import { welcomeEmail } from "./_email.js"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_SIGNUPS_PER_IP_PER_HOUR = 10

// Its own schema, so it can share a database without touching anything else in it.
const SCHEMA = `
  CREATE SCHEMA IF NOT EXISTS hot_smoothie;
  CREATE TABLE IF NOT EXISTS hot_smoothie.waitlist (
    id         bigserial PRIMARY KEY,
    email      text NOT NULL UNIQUE,
    source     text,
    ip_hash    text,
    emailed_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS waitlist_ip_recent ON hot_smoothie.waitlist (ip_hash, created_at);
`
let schemaReady = false

// Enough to rate limit a visitor without keeping their IP address.
function ipHash(req) {
  const ip = req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() || "unknown"
  return createHmac("sha256", process.env.DATABASE_URL).update(ip).digest("hex")
}

function sendWelcome(to) {
  const port = Number(process.env.SMTP_PORT ?? 465)
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 8000,
    socketTimeout: 10000,
  })
  return transport.sendMail({
    from: { name: "The Hot Smoothie Co.", address: process.env.SMTP_USER },
    to,
    headers: { "List-Unsubscribe": `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>` },
    ...welcomeEmail({ siteUrl: process.env.SITE_URL ?? "https://hotsmoothie.in" }),
  })
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }
  let body
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {})
  } catch {
    return res.status(400).json({ error: "Invalid request" })
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  if (email.length > 254 || !EMAIL.test(email)) return res.status(400).json({ error: "Invalid email" })
  const source = typeof body.source === "string" ? body.source.slice(0, 40) : null

  const db = new pg.Client({ connectionString: process.env.DATABASE_URL })
  try {
    await db.connect()
    if (!schemaReady) {
      await db.query(SCHEMA)
      schemaReady = true
    }
    const ip = ipHash(req)
    const recent = await db.query(
      "SELECT count(*)::int AS n FROM hot_smoothie.waitlist WHERE ip_hash = $1 AND created_at > now() - interval '1 hour'",
      [ip],
    )
    if (recent.rows[0].n >= MAX_SIGNUPS_PER_IP_PER_HOUR) return res.status(429).json({ error: "Too many signups" })

    const added = await db.query(
      "INSERT INTO hot_smoothie.waitlist (email, source, ip_hash) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING RETURNING id",
      [email, source, ip],
    )
    const dupe = added.rowCount === 0
    // One welcome per address, so this can't be used to flood someone's inbox. A send that
    // failed earlier is retried if they sign up again.
    const { rows } = await db.query("SELECT emailed_at FROM hot_smoothie.waitlist WHERE email = $1", [email])
    if (!rows[0].emailed_at) {
      try {
        await sendWelcome(email)
        await db.query("UPDATE hot_smoothie.waitlist SET emailed_at = now() WHERE email = $1", [email])
      } catch (err) {
        // They're on the list either way; the address stays out of the logs.
        console.error("welcome_email_failed", err.code ?? err.message)
      }
    }
    return res.status(200).json({ dupe })
  } catch (err) {
    console.error("waitlist_failed", err.code ?? err.message)
    return res.status(500).json({ error: "Could not save that" })
  } finally {
    await db.end().catch(() => {})
  }
}
