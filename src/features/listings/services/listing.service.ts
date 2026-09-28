import { createClient } from "@/lib/supabase/server";
import type {
  MarketplaceFilters,
  MarketplaceListing,
} from "@/features/listings/types/listing";

export async function getMarketplaceListings(
  filters: MarketplaceFilters = {},
): Promise<MarketplaceListing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select(
      "id,seller_id,title,description,category,condition,price_kobo,status,location_label,created_at,listing_images(storage_path,position)",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(48);

  if (filters.query) query = query.ilike("title", `%${filters.query}%`);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.minPriceKobo)
    query = query.gte("price_kobo", filters.minPriceKobo);
  if (filters.maxPriceKobo)
    query = query.lte("price_kobo", filters.maxPriceKobo);

  const { data, error } = await query;
  if (error) {
    console.error("Marketplace listing query failed", error);
    return [];
  }

  return (data ?? []) as MarketplaceListing[];
}

export async function getListingById(
  id: string,
): Promise<MarketplaceListing | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id,seller_id,title,description,category,condition,price_kobo,status,location_label,created_at,listing_images(storage_path,position)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Unable to load this listing.");
  return data as MarketplaceListing | null;
}
