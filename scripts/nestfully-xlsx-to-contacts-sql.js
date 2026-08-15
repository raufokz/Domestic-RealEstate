#!/usr/bin/env node
/**
 * Convert a Nestfully agent export (.xlsx -> .csv/.tsv) into MySQL INSERTs for
 * the internal `contacts` CRM table.
 *
 *   node scripts/nestfully-xlsx-to-contacts-sql.js agents.tsv > prospects.sql
 *
 * DESTINATION IS DELIBERATE. These rows are recruiting prospects, not members
 * of the network, so they land in `contacts` (internal CRM) and never in
 * `agent_profiles`, which powers the public /agents/[slug] pages. Publishing a
 * scraped agent there would present them as affiliated with the platform and
 * expose their personal mobile and email on a site they never joined.
 *
 * Rows are written with status 'active' but tagged as unverified prospects, so
 * an operator can see at a glance where the record came from.
 */

const fs = require("fs");

const file = process.argv[2];
if (!file) {
  console.error("usage: node nestfully-xlsx-to-contacts-sql.js <input.tsv>");
  process.exit(1);
}

const SOURCE = "nestfully.com export";

function q(v) {
  if (v === null || v === undefined || v === "") return "NULL";
  return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
}

const STATE_ABBR = {
  california: "CA", "new york": "NY", texas: "TX", florida: "FL",
  virginia: "VA", maryland: "MD", "washington dc": "DC", pennsylvania: "PA",
  "new jersey": "NJ", arizona: "AZ", nevada: "NV", georgia: "GA",
  illinois: "IL", "north carolina": "NC", colorado: "CO", washington: "WA",
};

/** "Pasadena, California 91106" -> { city, state, zip } */
function parseCityState(raw) {
  if (!raw) return {};
  const m = String(raw).match(/^(.*),\s*([A-Za-z .]+?)\s+(\d{5})(?:-\d{4})?$/);
  if (!m) return {};
  const stateRaw = m[2].trim();
  const state =
    stateRaw.length === 2 ? stateRaw.toUpperCase() : STATE_ABBR[stateRaw.toLowerCase()] || stateRaw;
  return { city: m[1].trim(), state, zip: m[3] };
}

/** Email is embedded in the site's contact-form javascript: URL. */
function extractEmail(jsUrl) {
  if (!jsUrl) return null;
  const m = String(jsUrl).match(/AgentEmailAddress=([^&'"]+)/i);
  if (!m) return null;
  const email = decodeURIComponent(m[1]).trim().toLowerCase();
  return /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email) ? email : null;
}

/** Placeholder numbers in this export are literal zeroes. */
function cleanPhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length !== 10 || /^0+$/.test(digits)) return null;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function splitName(full) {
  const parts = String(full || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
const seen = new Set();
const records = [];
const rejected = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  const c = line.split("\t");

  const name = splitName(c[0]);
  const email = extractEmail(c[9]);
  const profileUrl = (c[1] || "").trim();

  // No email means no way to contact or de-duplicate the record, and the
  // `contacts.email` column is UNIQUE and NOT NULL. Drop rather than invent.
  if (!name || !email) {
    rejected.push({ row: i + 1, name: c[0] || "(blank)", reason: !name ? "no name" : "no email" });
    continue;
  }
  if (seen.has(email)) {
    rejected.push({ row: i + 1, name: c[0], reason: "duplicate email" });
    continue;
  }
  seen.add(email);

  const loc = parseCityState(c[2]);
  const phone = cleanPhone(c[11]) || cleanPhone(c[4]);

  records.push({
    first: name.first,
    last: name.last,
    email,
    phone,
    company: (c[6] || "").trim() || null,
    address: (c[3] || "").trim() || null,
    city: loc.city || null,
    state: loc.state || null,
    zip: loc.zip || null,
    profileUrl: profileUrl || null,
  });
}

const out = [];
out.push("-- Recruiting prospect list -> contacts (internal CRM).");
out.push("-- NOT agent_profiles: these people have not joined the network and");
out.push("-- must not appear on the public /agents pages.");
out.push(`-- Parsed ${records.length} contacts, rejected ${rejected.length} rows.`);
out.push("");
out.push("START TRANSACTION;");
out.push("");

for (const r of records) {
  const metadata = JSON.stringify({
    source_profile_url: r.profileUrl,
    imported_at: new Date().toISOString().slice(0, 10),
    consent: "none - scraped public directory, do not email until reviewed",
  });
  out.push(`INSERT INTO contacts
  (first_name, last_name, email, phone, type, status, tags, source,
   company, address, city, state, zip, metadata, created_at, updated_at)
VALUES
  (${q(r.first)}, ${q(r.last)}, ${q(r.email)}, ${q(r.phone)},
   ${q(JSON.stringify(["agent"]))}, 'active',
   ${q(JSON.stringify(["prospect", "recruiting", "unverified"]))}, ${q(SOURCE)},
   ${q(r.company)}, ${q(r.address)}, ${q(r.city)}, ${q(r.state)}, ${q(r.zip)},
   ${q(metadata)}, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  phone = COALESCE(VALUES(phone), phone),
  company = COALESCE(VALUES(company), company),
  updated_at = NOW();`);
  out.push("");
}

out.push("COMMIT;");
out.push("");
console.log(out.join("\n"));

console.error(`parsed ${records.length} contacts, rejected ${rejected.length}`);
for (const r of rejected) console.error(`  row ${r.row}: ${r.name} - ${r.reason}`);
