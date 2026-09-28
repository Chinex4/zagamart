# Product route audit

## Audit summary and implementation plan

The initial repository already contained secure database tables, RLS policies, private storage buckets, Paystack webhook verification, transaction-state RPCs, KYC submission, payout actions, and basic authentication. The public landing page, marketplace, listing detail/create, student verification, payout page, and individual transaction/dispute pages existed. The UI did not have a shared application shell, and most collection/admin destinations linked by the intended navigation did not exist.

The implementation therefore reuses the deployed schema and trusted RPCs rather than duplicating payment or moderation logic. It adds responsive student/admin shells, completes collection/detail routes, introduces a separately branded admin sign-in that still uses Supabase Auth, adds genuine Supabase email OTP verification, and provides an explicitly invoked idempotent demo seed.

## Final screenshot route audit

| Figure | Screen                | Route                                     | Implemented | Functional                                   | Responsive | Data source                                         |
| ------ | --------------------- | ----------------------------------------- | ----------- | -------------------------------------------- | ---------- | --------------------------------------------------- |
| 4.1    | Login                 | `/login`                                  | Yes         | Supabase password auth                       | Yes        | Supabase Auth                                       |
| 4.2    | Email OTP             | `/verify-email`                           | Yes         | Supabase `verifyOtp` / resend                | Yes        | Supabase Auth                                       |
| 4.3    | Student KYC           | `/verification`                           | Yes         | Private uploads and submission               | Yes        | `student_verifications`, private KYC bucket         |
| 4.4    | Admin KYC             | `/admin/verifications`                    | Yes         | Signed documents, approve/reject RPC         | Yes        | `student_verifications`, private KYC bucket         |
| 4.5    | Landing page          | `/`                                       | Yes         | Search and marketplace/sell CTAs             | Yes        | Public content and marketplace links                |
| 4.6    | Marketplace           | `/marketplace`                            | Yes         | Search/category/condition/price filters      | Yes        | Active `listings`                                   |
| 4.7    | Listing detail/create | `/marketplace/[id]`, `/listings/new`      | Yes         | Secure listing creation and image upload     | Yes        | `listings`, public listing-image bucket             |
| 4.8    | Checkout              | `/checkout/[id]`                          | Yes         | Server-authoritative Paystack initialization | Yes        | `listings`, `transactions`, Paystack                |
| 4.9    | Transaction workspace | `/transactions/[id]`                      | Yes         | Role/state actions and timeline              | Yes        | `transactions`, transaction RPCs                    |
| 4.10   | Fraud flags           | `/admin/fraud`                            | Yes         | Admin-only risk review/filter                | Yes        | `fraud_flags`                                       |
| 4.11   | Student dispute       | `/transactions/[id]`                      | Yes         | Eligible submission and private evidence     | Yes        | dispute RPC, private evidence bucket                |
| 4.12   | Admin disputes        | `/admin/disputes`, `/admin/disputes/[id]` | Yes         | Signed evidence and safe resolution RPC      | Yes        | `disputes`, `transactions`, private evidence bucket |
| 4.13   | Student payouts       | `/payouts`                                | Yes         | Verified bank setup/request/history          | Yes        | Paystack, `bank_accounts`, `payout_requests`        |
| 4.14   | Admin payouts         | `/admin/payouts`                          | Yes         | Trusted status workflow                      | Yes        | payout RPC and `payout_requests`                    |
| 4.15   | Admin dashboard       | `/admin`                                  | Yes         | Live operational counts                      | Yes        | Supabase aggregate queries                          |
| 4.16   | Student dashboard     | `/dashboard`                              | Yes         | Live account/activity counts                 | Yes        | Supabase user-scoped queries                        |

All visible student and administrator shell destinations have corresponding App Router pages. Protected admin pages are grouped under an admin-only server layout; `/admin/login` remains outside that group so unauthorized users can reach the dedicated login safely.
