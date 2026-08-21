/**
 * Pure state-grouping helpers — deliberately no import of CITY_DB/CityData
 * from app/cities/[city]/page.tsx. That page already imports THIS module
 * (for the state-hub branch) and StateHubPage.tsx (which also needs these
 * helpers), so importing CITY_DB back from the page here would create a
 * page.tsx <-> cityStates.ts import cycle. Callers pass their own city map in.
 */

/** Convert a state name to its hub-page slug. Handles "D.C." -> "dc". */
export function slugifyState(state: string): string {
  return state
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface CityLike {
  name: string;
  state: string;
  country: string;
  medianHomePrice: string;
}

export interface StateGroup<T extends CityLike> {
  state: string;
  slug: string;
  cities: { slug: string; data: T }[];
}

/**
 * Group a CITY_DB-shaped map by US state, keyed by state slug.
 * Canadian cities are excluded — this hub is for the US state/city hierarchy;
 * Canadian provinces would need separate handling if added later.
 */
export function groupCitiesByState<T extends CityLike>(cityDb: Record<string, T>): Map<string, StateGroup<T>> {
  const groups = new Map<string, StateGroup<T>>();
  for (const [citySlug, data] of Object.entries(cityDb)) {
    if (data.country !== "USA" || !data.state) continue;
    const stateSlug = slugifyState(data.state);
    const group = groups.get(stateSlug) ?? { state: data.state, slug: stateSlug, cities: [] };
    group.cities.push({ slug: citySlug, data });
    groups.set(stateSlug, group);
  }
  for (const group of groups.values()) {
    group.cities.sort((a, b) => a.data.name.localeCompare(b.data.name));
  }
  return groups;
}
