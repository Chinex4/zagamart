"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/features/auth/services/auth.service";
import { listingSchema } from "@/features/listings/schemas/listing.schema";
import { createClient } from "@/lib/supabase/server";

export interface ListingActionState {
  error?: string;
}

export async function createListingAction(
  _state: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const user = await requireUser();
  const parsed = listingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    condition: formData.get("condition"),
    priceNaira: formData.get("priceNaira"),
    locationLabel: formData.get("locationLabel") || undefined,
  });

  if (!parsed.success) {
    return { error: "Check the listing details and try again." };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("verification_status,account_status")
    .eq("id", user.id)
    .single();

  if (
    profile?.verification_status !== "verified" ||
    profile.account_status !== "active"
  ) {
    return { error: "Only verified active students can publish listings." };
  }

  const { data, error } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      condition: parsed.data.condition,
      price_kobo: Math.round(parsed.data.priceNaira * 100),
      location_label: parsed.data.locationLabel || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Unable to publish the listing." };

  revalidatePath("/marketplace");
  redirect(`/marketplace/${data.id}`);
}
