import { NextResponse } from "next/server";
import { publicEnvironment } from "@/lib/env";
import { settleVerifiedPayment } from "@/features/transactions/services/checkout.service";
export async function GET(request:Request){const url=new URL(request.url);const reference=url.searchParams.get("reference")??url.searchParams.get("trxref");if(!reference)return NextResponse.redirect(`${publicEnvironment.NEXT_PUBLIC_SITE_URL}/marketplace`);const result=await settleVerifiedPayment(reference);return NextResponse.redirect(`${publicEnvironment.NEXT_PUBLIC_SITE_URL}${result.ok?`/transactions/${result.transactionId}?payment=success`:"/marketplace?payment=unverified"}`)}
