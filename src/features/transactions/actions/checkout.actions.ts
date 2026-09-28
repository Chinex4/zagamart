"use server";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/services/auth.service";
import { initializeCheckout } from "@/features/transactions/services/checkout.service";
export async function startCheckoutAction(formData:FormData){const user=await requireUser();const listingId=formData.get("listingId");if(typeof listingId!=="string"||!listingId)redirect("/marketplace");if(!user.email)throw new Error("Your account does not have a payment email.");const checkout=await initializeCheckout({listingId,buyerId:user.id,buyerEmail:user.email});redirect(checkout.authorizationUrl)}
