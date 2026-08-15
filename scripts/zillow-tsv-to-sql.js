#!/usr/bin/env node
/**
 * Convert a pasted Zillow search-results export (tab-separated) into MySQL
 * INSERT statements for `properties` + `property_images`.
 *
 *   node scripts/zillow-tsv-to-sql.js input.tsv > seed.sql
 *
 * Why it does not read fixed column positions: the exports are ragged. When a
 * listing has no beds value the whole row shifts left, so "bds" lands in the
 * column where the number should be and the bedroom count ends up in column 1.
 * Every field is therefore located by what it looks like, not by where it sits.
 *
 * Rows that are clearly not listings ("Loading...", blank lines) are skipped.
 */

const fs = require("fs");

const file = process.argv[2];
if (!file) {
  console.error("usage: node zillow-tsv-to-sql.js <input.tsv>");
  process.exit(1);
}

/** MySQL string literal, or NULL. */
function q(v) {
  if (v === null || v === undefined || v === "") return "NULL";
  return "'" + String(v).replace(/\\/g, "\\\\").replace(/'/g, "''") + "'";
}

/** Numeric literal, or NULL. */
function n(v) {
  if (v === null || v === undefined || v === "") return "NULL";
  const num = Number(v);
  return Number.isFinite(num) ? String(num) : "NULL";
}

/** "265-04 79th Avenue, Glen Oaks, NY 11004" -> parts. */
function parseAddress(raw) {
  const m = raw.match(/^(.*),\s*([^,]+),\s*([A-Z]{2})\s+(\d{5})(?:-\d{4})?$/);
  if (!m) return null;
  return { address: m[1].trim(), city: m[2].trim(), state: m[3], zip: m[4] };
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

/** Pull lat/lng and open-house window out of the embedded JSON-LD cell. */
function parseJsonLd(cell) {
  const out = {};
  if (!cell || !cell.includes("schema.org")) return out;
  let text = cell.trim();
  // The export double-quotes the JSON and doubles inner quotes.
  if (text.startsWith('"') && text.endsWith('"')) text = text.slice(1, -1);
  text = text.replace(/""/g, '"');
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return out;
  }

  const findGeo = (node) => {
    if (!node || typeof node !== "object") return null;
    if (Array.isArray(node)) {
      for (const item of node) {
        const hit = findGeo(item);
        if (hit) return hit;
      }
      return null;
    }
    if (node.geo && node.geo.latitude != null) return node.geo;
    return findGeo(node.location);
  };
  const geo = findGeo(data);
  if (geo) {
    out.latitude = geo.latitude;
    out.longitude = geo.longitude;
  }

  // Only a genuine open house carries a time-of-day window; a 3D-tour event
  // uses date-only stamps and is not an open house.
  const isOpenHouse = /open house/i.test(data.name || "") || /open house/i.test(data.description || "");
  if (isOpenHouse && typeof data.startDate === "string" && data.startDate.includes("T")) {
    out.openHouseStart = data.startDate.replace("T", " ");
    if (typeof data.endDate === "string") out.openHouseEnd = data.endDate.replace("T", " ");
  }
  return out;
}

function parseRow(line) {
  const cells = line.split("\t").map((c) => c.trim());
  if (cells.every((c) => c === "" || /^loading/i.test(c))) return null;

  const detailUrl = cells.find((c) => /^https:\/\/www\.zillow\.com\//.test(c));
  if (!detailUrl) return null;

  const images = cells.filter((c) => /^https:\/\/photos\.zillowstatic\.com\//.test(c));

  const priceCell = cells.find((c) => /^\$[\d,]+\+?$/.test(c));
  const price = priceCell ? Number(priceCell.replace(/[^0-9]/g, "")) : null;
  // A trailing "+" means "from this price" on a new-construction plan.
  const priceIsFrom = !!(priceCell && priceCell.endsWith("+"));

  // Beds / baths / sqft: read the value immediately BEFORE its unit label.
  // If that slot is not a number the row was shifted, so fall back to cell 0.
  const valueBefore = (unitRe) => {
    const i = cells.findIndex((c) => unitRe.test(c));
    if (i === -1) return null;
    const prev = cells[i - 1];
    if (prev && /^[\d,.]+$/.test(prev)) return Number(prev.replace(/,/g, ""));
    if (/^[\d,.]+$/.test(cells[0] || "")) return Number(cells[0].replace(/,/g, ""));
    return null;
  };

  const bedrooms = valueBefore(/^bds?$/i);
  const bathrooms = valueBefore(/^ba$/i);
  const sqft = valueBefore(/^sqft$/i);

  const addressCell = cells.find((c) => parseAddress(c));
  const addr = addressCell ? parseAddress(addressCell) : null;

  const statusCell = cells.find((c) =>
    /^(House for sale|Active|New construction|For sale|Pending|Coming soon)$/i.test(c)
  );

  const listingByCell = cells.find((c) => /^LISTING BY:/i.test(c));
  const brokerage = listingByCell ? listingByCell.replace(/^LISTING BY:\s*/i, "").trim() : null;

  const ld = parseJsonLd(cells[0]);

  // A community/plan row has no street address — keep it, but flag it so the
  // caller can decide whether plans belong in the listings table.
  const isPlan = !addr;
  const title = addr ? addr.address : (addressCell || cells.find((c) => /Plan/i.test(c)) || "Untitled listing");

  return {
    detailUrl,
    images,
    price,
    priceIsFrom,
    bedrooms,
    bathrooms,
    sqft,
    addr,
    isPlan,
    title,
    rawLocation: addressCell || null,
    status: statusCell || null,
    brokerage,
    ...ld,
  };
}

const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
const rows = [];
const skipped = [];

for (const line of lines) {
  if (!line.trim()) continue;
  const row = parseRow(line);
  if (row) rows.push(row);
  else skipped.push(line.slice(0, 60));
}

const out = [];
out.push("-- Generated by scripts/zillow-tsv-to-sql.js");
out.push(`-- Source rows parsed: ${rows.length}, skipped: ${skipped.length}`);
out.push("--");
out.push("-- NOTE: image `path` values are remote zillowstatic.com URLs. See the");
out.push("-- caveats in the chat response before using these outside a dev seed.");
out.push("");
out.push("START TRANSACTION;");
out.push("");

rows.forEach((r, idx) => {
  const slugBase = r.addr
    ? `${r.addr.address}-${r.addr.city}-${r.addr.state}-${r.addr.zip}`
    : `${r.title}-${idx}`;
  const slug = slugify(slugBase);

  // Attribution is kept in the description so the source brokerage travels with
  // the record. No marketing copy is invented.
  const descParts = [];
  if (r.brokerage) descParts.push(`Listed by ${r.brokerage}.`);
  if (r.priceIsFrom) descParts.push("Price shown is a starting price for this plan.");
  descParts.push(`Source: ${r.detailUrl}`);
  const description = descParts.join(" ");

  const status = "active";
  const city = r.addr ? r.addr.city : null;
  const state = r.addr ? r.addr.state : null;
  const zip = r.addr ? r.addr.zip : null;
  const address = r.addr ? r.addr.address : r.rawLocation || r.title;

  out.push(`-- [${idx + 1}] ${r.title}`);
  out.push(`INSERT INTO properties
  (uuid, slug, title, description, property_type_id, status, approval_status,
   price, price_type, bedrooms, bathrooms, sqft,
   address, city, state, zip, country, latitude, longitude,
   photos, open_house_date, open_house_end,
   listed_by_type, featured, premium, created_at, updated_at)
VALUES
  (UUID(), ${q(slug)}, ${q(r.title)}, ${q(description)},
   (SELECT id FROM property_types WHERE slug = 'residential' LIMIT 1),
   ${q(status)}, 'approved',
   ${n(r.price)}, 'sale', ${n(r.bedrooms)}, ${n(r.bathrooms)}, ${n(r.sqft)},
   ${q(address)}, ${q(city)}, ${q(state)}, ${q(zip)}, 'US',
   ${n(r.latitude)}, ${n(r.longitude)},
   ${q(JSON.stringify(r.images))},
   ${q(r.openHouseStart)}, ${q(r.openHouseEnd)},
   'system', 0, 0, NOW(), NOW());`);
  out.push(`SET @pid = LAST_INSERT_ID();`);

  r.images.forEach((img, i) => {
    out.push(`INSERT INTO property_images (property_id, path, is_featured, sort_order, created_at, updated_at)
VALUES (@pid, ${q(img)}, ${i === 0 ? 1 : 0}, ${i}, NOW(), NOW());`);
  });
  out.push("");
});

out.push("COMMIT;");
out.push("");

console.log(out.join("\n"));
console.error(`parsed ${rows.length} listings, skipped ${skipped.length} non-listing rows`);
rows.forEach((r, i) => {
  const missing = [];
  if (r.price == null) missing.push("price");
  if (r.bedrooms == null) missing.push("bedrooms");
  if (r.bathrooms == null) missing.push("bathrooms");
  if (r.sqft == null) missing.push("sqft");
  if (!r.addr) missing.push("parsed address");
  if (missing.length) console.error(`  row ${i + 1} (${r.title}): missing ${missing.join(", ")}`);
});
