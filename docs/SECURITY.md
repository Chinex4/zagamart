# Security

Zagamart uses defense in depth.

- Enforce authorization server-side and with RLS.
- Never expose service-role credentials to client code.
- Keep KYC and dispute evidence private.
- Verify payment state server-side.
- Validate webhook signatures and enforce idempotency.
- Audit sensitive administrative actions.
- Treat browser-supplied IDs, prices, roles, and state transitions as untrusted.

Security tests must include unauthorized direct data access and negative transaction cases.
