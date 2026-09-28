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
  ) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body) as Event;
  const reference = event.data?.reference;
  const eventId = `${event.event}:${event.data?.id ?? reference ?? "unknown"}`;
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("payment_events")
    .select("processed_at")
    .eq("provider_event_id", eventId)
    .maybeSingle();

  if (existing?.processed_at) {
    return NextResponse.json({ received: true });
  }

  if (!existing) {
    const { error } = await admin.from("payment_events").insert({
      provider: "paystack",
      provider_event_id: eventId,
      event_type: event.event,
      payment_reference: reference ?? null,
      payload: event,
    });
    if (error?.code === "23505") {
      return new NextResponse("Retry event", { status: 503 });
    }
    if (error) {
      return new NextResponse("Unable to record event", { status: 500 });
    }
  }

  if (event.event === "charge.success" && reference) {
    const result = await settleVerifiedPayment(reference);
    if (!result.ok) {
      return new NextResponse("Verification failed", { status: 409 });
    }
  }

  const { error: processedError } = await admin
    .from("payment_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("provider_event_id", eventId)
    .is("processed_at", null);

  if (processedError) {
    return new NextResponse("Unable to finalize event", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
