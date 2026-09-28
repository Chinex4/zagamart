export type ListingStatus = "draft" | "active" | "reserved" | "sold" | "archived";

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price_kobo: number;
  status: ListingStatus;
  location_label: string | null;
  created_at: string;
  listing_images: Array<{ storage_path: string; position: number }>;
}

export interface MarketplaceFilters {
  query?: string;
  category?: string;
  condition?: string;
  minPriceKobo?: number;
  maxPriceKobo?: number;
}
