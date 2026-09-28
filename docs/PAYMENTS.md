# Payments

Paystack is the payment provider. Zagamart does not describe Paystack as a generic escrow provider.

Protected lifecycle:

`pending_payment → paid_held → release_pending → released`

Eligible transactions can also become `disputed`, `refunded`, or `cancelled`.

The server determines authoritative amounts and verifies payment reference, amount, currency, and provider status. Webhook processing must be idempotent.
