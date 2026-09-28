# Payments

Paystack is the payment provider. Zagamart does not describe Paystack as a generic escrow provider.

Protected lifecycle:

`pending_payment → paid_held → release_pending → released`

Eligible transactions can also become `disputed`, `refunded`, or `cancelled`.

The server determines authoritative amounts and verifies payment reference, amount, currency, and provider status. Webhook processing must be idempotent.

## Disputes and release

Only a transaction party can open a dispute while the protected transaction is `paid_held` or `release_pending`. Opening a dispute atomically moves it to `disputed`.

The buyer can confirm receipt, moving `paid_held` to `release_pending`. Actual seller payout remains a separate trusted operation.

Administrative dispute resolution is server-authoritative and audited. Provider-side refunds and seller payouts remain separate trusted financial operations.
