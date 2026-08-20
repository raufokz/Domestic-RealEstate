import { z } from "zod";

/**
 * Client-side contract for the atomic listing write endpoints.
 *
 *   POST /properties          -> create
 *   PUT  /properties/{id}     -> update
 *
 * These mirror PropertyWriteRequest on the Laravel side. The server revalidates
 * everything — this exists so the form can fail fast and show field errors
 * without a round trip, not as the security boundary.
 *
 * Field names deliberately match the existing database columns (`sqft`,
 * `realtor_id`, `zip`) rather than inventing a parallel vocabulary, so a
 * payload built here maps 1:1 onto what the API stores.
 */

export const LISTING_STATUS = [
  "draft",
  "active",
  "pending",
  "under_contract",
  "sold",
  "expired",
  "withdrawn",
  "archived",
] as const;

export const LISTING_TYPE = ["sale", "rent", "lease", "off_market"] as const;
export const APPROVAL_STATUS = ["draft", "pending", "approved", "rejected"] as const;
export const MEDIA_TYPE = ["image", "floor_plan", "video"] as const;

export type ListingStatus = (typeof LISTING_STATUS)[number];
export type ListingType = (typeof LISTING_TYPE)[number];
export type MediaType = (typeof MEDIA_TYPE)[number];

/** A file already uploaded to storage; only its URL/handle travels in the payload. */
export const mediaItemSchema = z.object({
  file_url: z.string().min(1, "Image URL is required").max(2048),
  /** Storage provider handle (S3 key / Cloudinary public_id) so it can be deleted later. */
  public_id: z.string().max(255).nullish(),
  media_type: z.enum(MEDIA_TYPE).default("image"),
  caption: z.string().max(255).nullish(),
  display_order: z.number().int().min(0).nullish(),
  original_name: z.string().max(255).nullish(),
  mime_type: z.string().max(100).nullish(),
  size: z.number().int().min(0).nullish(),
});

/**
 * Every gallery operation for one request.
 * `remove` and `order` carry existing PropertyImage ids; the server re-checks
 * that each id belongs to this listing before touching it.
 */
export const mediaOpsSchema = z.object({
  add: z.array(mediaItemSchema).max(60).optional(),
  remove: z.array(z.number().int()).max(60).optional(),
  order: z.array(z.number().int()).max(200).optional(),
  cover_id: z.number().int().nullish(),
});

const currentYear = new Date().getFullYear();

/** Fields shared by create and update, all optional at this layer. */
const propertyCore = {
  title: z.string().trim().min(3, "Title is required").max(255),
  description: z.string().max(20000).nullish(),

  price: z.coerce.number().min(0).max(999_999_999),
  original_price: z.coerce.number().min(0).max(999_999_999).nullish(),
  price_type: z.enum(LISTING_TYPE).optional(),
  status: z.enum(LISTING_STATUS).optional(),

  property_type_id: z.coerce.number().int().positive().nullish(),
  sub_type: z.string().max(100).nullish(),

  bedrooms: z.coerce.number().int().min(0).max(100).nullish(),
  bathrooms: z.coerce.number().min(0).max(100).nullish(),
  half_bathrooms: z.coerce.number().int().min(0).max(100).nullish(),
  sqft: z.coerce.number().int().min(0).max(10_000_000).nullish(),
  lot_size: z.coerce.number().min(0).nullish(),
  year_built: z.coerce.number().int().min(1600).max(currentYear + 5).nullish(),
  floors: z.coerce.number().int().min(0).max(200).nullish(),
  parking_spaces: z.coerce.number().int().min(0).max(100).nullish(),
  hoa_fees: z.coerce.number().min(0).nullish(),
  property_taxes_annual: z.coerce.number().min(0).nullish(),

  address: z.string().trim().min(3, "Street address is required").max(255),
  address_line2: z.string().max(255).nullish(),
  city: z.string().trim().min(1, "City is required").max(120),
  state: z.string().trim().min(2, "State is required").max(60),
  zip: z.string().trim().min(3, "ZIP is required").max(20),
  county: z.string().max(120).nullish(),
  country: z.string().length(2).optional(),
  neighborhood: z.string().max(120).nullish(),
  latitude: z.coerce.number().min(-90).max(90).nullish(),
  longitude: z.coerce.number().min(-180).max(180).nullish(),

  virtual_tour_url: z.string().url().max(2048).nullish(),
  video_url: z.string().url().max(2048).nullish(),
  open_house_date: z.string().nullish(),
  open_house_end: z.string().nullish(),

  amenities: z.array(z.string().max(80)).max(100).optional(),

  /**
   * Staff-only. An agent may send these and the server will silently drop
   * them — they are typed here so an admin screen can set them, not so an
   * agent form can.
   */
  featured: z.boolean().optional(),
  premium: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  approval_status: z.enum(APPROVAL_STATUS).optional(),
  realtor_id: z.coerce.number().int().positive().optional(),
  broker_id: z.coerce.number().int().positive().nullish(),
};

/** Open house must not end before it starts — checked on both create and update. */
const openHouseOrder = (
  data: { open_house_date?: string | null; open_house_end?: string | null },
  ctx: z.RefinementCtx
) => {
  if (data.open_house_date && data.open_house_end) {
    if (new Date(data.open_house_end) < new Date(data.open_house_date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["open_house_end"],
        message: "The open house cannot end before it starts.",
      });
    }
  }
};

export const createPropertySchema = z
  .object({ ...propertyCore, media: mediaOpsSchema.optional() })
  .superRefine(openHouseOrder);

/**
 * Update accepts any subset — a price change should not require resending the
 * whole listing. `.partial()` is applied before the refinement so the
 * open-house check still runs when both dates are present.
 */
export const updatePropertySchema = z
  .object({ ...propertyCore, media: mediaOpsSchema.optional() })
  .partial()
  .superRefine(openHouseOrder);

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyMediaInput = z.infer<typeof mediaItemSchema>;
export type PropertyMediaOps = z.infer<typeof mediaOpsSchema>;

/** Shape returned by both write endpoints (property + eager-loaded images). */
export interface WrittenPropertyMedia {
  id: number;
  property_id: number;
  path: string;
  public_id: string | null;
  media_type: MediaType;
  caption: string | null;
  is_featured: boolean;
  sort_order: number;
}

export interface WrittenProperty {
  id: number;
  uuid: string;
  slug: string;
  title: string;
  price: string;
  original_price: string | null;
  status: ListingStatus;
  price_type: ListingType;
  approval_status: (typeof APPROVAL_STATUS)[number];
  featured: boolean;
  is_verified: boolean;
  realtor_id: number | null;
  seller_id: number | null;
  created_by: number | null;
  images: WrittenPropertyMedia[];
}

/**
 * Flatten a Zod error into `{ field: message }`, matching how Laravel returns
 * `errors`, so one renderer can display client and server errors alike.
 */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
