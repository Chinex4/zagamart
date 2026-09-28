import { z } from "zod";

export const LISTING_CATEGORIES = [
  "Electronics",
  "Phones & Accessories",
  "Fashion",
  "Books & Academics",
  "Home & Hostel",
  "Sports & Fitness",
  "Other",
] as const;

export const LISTING_CONDITIONS = ["New", "Like new", "Good", "Fair"] as const;

export const listingSchema = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(10).max(5000),
  category: z.enum(LISTING_CATEGORIES),
  condition: z.enum(LISTING_CONDITIONS),
  priceNaira: z.coerce.number().positive().max(100_000_000),
  locationLabel: z.string().trim().max(120).optional(),
});

export type ListingInput = z.infer<typeof listingSchema>;
