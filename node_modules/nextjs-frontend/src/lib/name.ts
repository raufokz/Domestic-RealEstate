interface NameSource {
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  name?: string | null;
}

export function fullName(p?: NameSource | null): string {
  if (!p) return "";
  return (
    p.full_name ||
    [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
    p.name ||
    ""
  );
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  return parts.map((n) => n[0]).join("").toUpperCase() || "?";
}
