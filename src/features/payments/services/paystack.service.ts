import { createHmac, timingSafeEqual } from "node:crypto";
import { getServerEnvironment } from "@/lib/env";
const PAYSTACK_API_URL = "https://api.paystack.co";
interface Envelope<T> {
  status: boolean;
  message: string;
  data: T;
}
export interface PaystackVerification {
  id: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
}
function key() {
  const value = getServerEnvironment().PAYSTACK_SECRET_KEY;
  if (!value) throw new Error("Paystack is not configured.");
  return value;
}
async function request<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${PAYSTACK_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const payload = (await response.json()) as Envelope<T>;
  if (!response.ok || !payload.status)
    throw new Error(payload.message || "Paystack request failed.");
  return payload.data;
}
export async function initializePaystackTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  transactionId: string;
}) {
  return request<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: String(input.amountKobo),
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: JSON.stringify({ transaction_id: input.transactionId }),
    }),
  });
}
export function verifyPaystackTransaction(reference: string) {
  return request<PaystackVerification>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
}
export function hasValidPaystackSignature(
  body: string,
  signature: string | null,
) {
  if (!signature) return false;
  const expected = Buffer.from(
    createHmac("sha512", key()).update(body).digest("hex"),
  );
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
