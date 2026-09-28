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
    .select("role,verification_status,account_status")
    .eq("id", user.id)
    .single();

  if (
    profile?.role !== "student" ||
    profile.verification_status !== "verified" ||
    profile.account_status !== "active"
  ) {
    return { error: "Only verified active student accounts can publish listings." };
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

  if (error || !data) {
    console.error("Listing creation failed", error);
    return { error: "Unable to publish the listing. Please try again." };
  }

  const images = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (
    images.length > 5 ||
    images.some(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 5 * 1024 * 1024,
    )
  ) {
    await supabase.from("listings").delete().eq("id", data.id);
    return {
      error: "Upload up to five JPG, PNG, or WebP images under 5 MB each.",
    };
  }
  for (const [position, file] of images.entries()) {
    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const path = `${user.id}/${data.id}/${crypto.randomUUID()}.${extension}`;
    const upload = await supabase.storage
      .from("listing-images")
      .upload(path, file, { contentType: file.type });
    if (!upload.error)
      await supabase
        .from("listing_images")
        .insert({ listing_id: data.id, storage_path: path, position });
  }

  revalidatePath("/marketplace");
  redirect(`/marketplace/${data.id}`);
}
