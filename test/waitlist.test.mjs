// TEST_DATABASE_URL=postgres://... npm test
// Points SMTP at a closed port, so nothing is ever emailed, and uses its own disposable database.
import assert from "node:assert/strict"
import { after, before, test } from "node:test"

import pg from "pg"

const url = process.env.TEST_DATABASE_URL
assert.ok(url, "set TEST_DATABASE_URL to a throwaway database")
Object.assign(process.env, { DATABASE_URL: url, SMTP_HOST: "127.0.0.1", SMTP_PORT: "1", SMTP_USER: "x@example.com", SMTP_PASS: "x" })
const { default: handler } = await import("../api/waitlist.js")

const db = new pg.Client({ connectionString: url })

async function call({ method = "POST", body, ip = "1.1.1.1" }) {
  const out = {}
  const res = {
    setHeader() {},
    status(code) {
      out.status = code
      return this
    },
    json(data) {
      out.body = data
      return this
    },
  }
  await handler({ method, body, headers: { "x-real-ip": ip } }, res)
  return out
}

before(async () => {
  await db.connect()
  await db.query("DROP SCHEMA IF EXISTS hot_smoothie CASCADE")
})
after(() => db.end())

test("rejects other methods and bad input", async () => {
  assert.equal((await call({ method: "GET" })).status, 405)
  assert.equal((await call({ body: "{not json" })).status, 400)
  assert.equal((await call({ body: { email: "nope" } })).status, 400)
  assert.equal((await call({ body: { email: "a b@example.com" } })).status, 400)
  assert.equal((await call({ body: { email: ["a@example.com"] } })).status, 400)
  assert.equal((await call({ body: { email: `${"a".repeat(250)}@example.com` } })).status, 400)
})

test("saves a signup even if the email can't be sent, and normalises duplicates", async () => {
  assert.deepEqual(await call({ body: { email: " New@Example.COM ", source: "coming-soon" } }), { status: 200, body: { dupe: false } })
  assert.deepEqual(await call({ body: { email: "new@example.com" } }), { status: 200, body: { dupe: true } })
  const { rows } = await db.query("SELECT email, source, emailed_at, ip_hash FROM hot_smoothie.waitlist WHERE email LIKE 'new@%'")
  assert.equal(rows.length, 1)
  assert.equal(rows[0].source, "coming-soon")
  assert.equal(rows[0].emailed_at, null)
  assert.ok(!rows[0].ip_hash.includes("1.1.1.1"))
})

test("an injection attempt is just a rejected string", async () => {
  assert.equal((await call({ body: { email: "x'); DROP TABLE waitlist;--@e.co\nBcc: v@e.co" } })).status, 400)
  assert.equal((await call({ body: { email: "x';DROP--@example.com", ip: "7.7.7.7" } })).status, 200)
  assert.equal((await db.query("SELECT count(*)::int n FROM hot_smoothie.waitlist")).rows[0].n, 2)
})

test("limits new signups per visitor, not everyone", async () => {
  for (let i = 0; i < 10; i++) assert.equal((await call({ body: { email: `r${i}@example.com` }, ip: "9.9.9.9" })).status, 200)
  assert.equal((await call({ body: { email: "r10@example.com" }, ip: "9.9.9.9" })).status, 429)
  assert.equal((await call({ body: { email: "other@example.com" }, ip: "8.8.8.8" })).status, 200)
})
