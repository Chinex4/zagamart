import { NextResponse } from "next/server";
import { hasValidPaystackSignature } from "@/features/payments/services/paystack.service";
import { settleVerifiedPayment } from "@/features/transactions/services/checkout.service";
import { createAdminClient } from "@/lib/supabase/admin";
interface Event {
  event: string;
  data?: { reference?: string; id?: number };
}
export async function POST(request: Request) {
  const body = await request.text();
  if (
    !hasValidPaystackSignature(
      body,
      request.headers.get("x-paystack-signature"),
    )
  )
    return new NextResponse("Invalid signature", { status: 401 });
  const event = JSON.parse(body) as Event;
  const reference = event.data?.reference;
  const eventId = `${event.event}:${event.data?.id ?? reference ?? "unknown"}`;
  const admin = createAdminClient();
  const { error } = await admin
    .from("payment_events")
    .insert({
      provider: "paystack",
      provider_event_id: eventId,
      event_type: event.event,
      payment_reference: reference ?? null,
      payload: event,
    });
  if (error?.code === "23505") return NextResponse.json({ received: true });
  if (error) return new NextResponse("Unable to record event", { status: 500 });
  if (event.event === "charge.success" && reference) {
    const result = await settleVerifiedPayment(reference);
    if (!result.ok)
      return new NextResponse("Verification failed", { status: 409 });
  }
  await admin
    .from("payment_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("provider_event_id", eventId);
  return NextResponse.json({ received: true });
}
