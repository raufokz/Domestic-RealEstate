#!/usr/bin/env node
/**
 * Convert a Nestfully agent export (TSV) into MySQL INSERTs for
 * `users` + `agent_profiles`.
 *
 *   node scripts/nestfully-to-agent-profiles-sql.js agents.tsv > agents.sql
 *
 * VISIBILITY: rows are written with is_published = 0 and status = 'pending'.
 * AgentController::index/show require is_published = 1 AND status IN
 * ('approved','verified'), so nothing here reaches the public /agents pages
 * until someone approves it in admin. That is the app's own gate, not an extra
 * one invented here — flipping it is a deliberate decision, not a side effect
 * of running this file.
 *
 * NOT POPULATED, because the source has no such data and inventing it would put
 * false numbers on a real person's profile:
 *   rating, review_count, sales_count  -> left at the column default of 0
 *   bio, headline, license_number      -> NULL
 *   license_status                     -> 'pending' (unverified)
 *
 * Accounts are created with an unusable password hash. These people never
 * signed up, so none of them should be able to authenticate.
 */

const fs = require("fs");

const file = process.argv[2];
if (!file) {
  console.error("usage: node nestfully-to-agent-profiles-sql.js <input.tsv>");
  process.exit(1);
}

/* bcrypt never produces this, so Hash::check() can only ever return false.
   Any of these agents who later joins must go through a real password reset. */
const UNUSABLE_PASSWORD = "!invalid-no-login-imported-record";

function q(v) {
  if (v === null || v === undefined || v === "") return "NULL";
  return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
}

const STATE_ABBR = {
  california: "CA", "new york": "NY", texas: "TX", florida: "FL",
  virginia: "VA", maryland: "MD", pennsylvania: "PA", "new jersey": "NJ",
  arizona: "AZ", nevada: "NV", georgia: "GA", illinois: "IL",
  "north carolina": "NC", colorado: "CO", washington: "WA",
};

function parseCityState(raw) {
  if (!raw) return {};
  const m = String(raw).match(/^(.*),\s*([A-Za-z .]+?)\s+(\d{5})(?:-\d{4})?$/);
  if (!m) return {};
  const s = m[2].trim();
  return {
    city: m[1].trim(),
    state: s.length === 2 ? s.toUpperCase() : STATE_ABBR[s.toLowerCase()] || s,
    zip: m[3],
  };
}

function extractEmail(jsUrl) {
  if (!jsUrl) return null;
  const m = String(jsUrl).match(/AgentEmailAddress=([^&'"]+)/i);
  if (!m) return null;
  const e = decodeURIComponent(m[1]).trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(e) ? e : null;
}

function cleanPhone(raw) {
  if (!raw) return null;
  const d = String(raw).replace(/\D/g, "");
  if (d.length !== 10 || /^0+$/.test(d)) return null;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 150);
}

/** Nestfully profile URLs end in a stable numeric id — use it to keep slugs unique. */
function sourceId(url) {
  const m = String(url || "").match(/-(\d+)\s*$/);
  return m ? m[1] : null;
}

const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
const seenEmail = new Set();
const seenSlug = new Set();
const records = [];
const rejected = [];

for (let i = 1; i < lines.length; i++) {
  if (!lines[i].trim()) continue;
  const c = lines[i].split("\t");

  const fullName = (c[0] || "").trim();
  const email = extractEmail(c[9]);
  const profileUrl = (c[1] || "").trim();

  // users.email is UNIQUE and NOT NULL, and it is the only reliable identity
  // key in this export. No email -> no row.
  if (!fullName || !email) {
    rejected.push({ row: i + 1, name: fullName || "(blank)", reason: !fullName ? "no name" : "no email" });
    continue;
  }
  if (seenEmail.has(email)) {
    rejected.push({ row: i + 1, name: fullName, reason: "duplicate email" });
    continue;
  }
  seenEmail.add(email);

  let slug = slugify(fullName);
  const sid = sourceId(profileUrl);
  if (seenSlug.has(slug) && sid) slug = `${slug}-${sid}`;
  while (seenSlug.has(slug)) slug = `${slug}-x`;
  seenSlug.add(slug);

  const loc = parseCityState(c[2]);

  records.push({
    name: fullName,
    email,
    slug,
    phone: cleanPhone(c[11]) || cleanPhone(c[4]),
    officePhone: cleanPhone(c[4]),
    brokerage: (c[6] || "").trim() || null,
    address: (c[3] || "").trim() || null,
    city: loc.city || null,
    state: loc.state || null,
    zip: loc.zip || null,
    profileUrl: profileUrl || null,
  });
}

const out = [];
out.push("-- Imported agent directory records (users + agent_profiles).");
out.push("-- is_published = 0 and status = 'pending': these do NOT appear on the");
out.push("-- public /agents pages until approved in admin.");
out.push("-- Ratings, review counts and sales counts are left at 0 - the source");
out.push("-- has no such data and inventing it would falsify a real profile.");
out.push(`-- Parsed ${records.length}, rejected ${rejected.length}.`);
out.push("");
out.push("START TRANSACTION;");
out.push("");

for (const r of records) {
  const socials = r.profileUrl ? JSON.stringify({ profile: r.profileUrl }) : null;

  out.push(`-- ${r.name} <${r.email}>`);
  out.push(`INSERT INTO users
  (name, email, password, role, status, phone, email_verified_at, created_at, updated_at)
VALUES
  (${q(r.name)}, ${q(r.email)}, ${q(UNUSABLE_PASSWORD)}, 'agent', 'pending', ${q(r.phone)}, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  phone = COALESCE(VALUES(phone), phone),
  updated_at = NOW();`);

  // Re-select rather than trusting LAST_INSERT_ID(), which is unreliable when
  // the row above hit the ON DUPLICATE branch instead of inserting.
  out.push(`SET @uid = (SELECT id FROM users WHERE email = ${q(r.email)} LIMIT 1);`);

  out.push(`INSERT INTO agent_profiles
  (user_id, slug, brokerage_name, license_status,
   office_address, office_city, office_state, office_zip, office_country,
   office_phone, office_email, social_links,
   is_published, status, created_at, updated_at)
VALUES
  (@uid, ${q(r.slug)}, ${q(r.brokerage)}, 'pending',
   ${q(r.address)}, ${q(r.city)}, ${q(r.state)}, ${q(r.zip)}, 'US',
   ${q(r.officePhone)}, ${q(r.email)}, ${q(socials)},
   0, 'pending', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  brokerage_name = COALESCE(VALUES(brokerage_name), brokerage_name),
  office_phone   = COALESCE(VALUES(office_phone), office_phone),
  updated_at     = NOW();`);
  out.push("");
}

out.push("COMMIT;");
out.push("");
out.push("-- Review before exposing anything publicly:");
out.push("--   SELECT ap.id, u.name, u.email, ap.brokerage_name, ap.office_city");
out.push("--   FROM agent_profiles ap JOIN users u ON u.id = ap.user_id");
out.push("--   WHERE ap.status = 'pending';");
out.push("");

console.log(out.join("\n"));
console.error(`parsed ${records.length} agents, rejected ${rejected.length}`);
for (const r of rejected) console.error(`  row ${r.row}: ${r.name} - ${r.reason}`);
