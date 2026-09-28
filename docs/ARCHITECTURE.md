# Architecture

Zagamart uses Next.js App Router with React Server Components as the default rendering boundary.

- Next.js owns UI and trusted server boundaries.
- Supabase Auth owns authentication identity.
- PostgreSQL is the authoritative datastore.
- RLS is part of the authorization boundary.
- TanStack Query owns remote state for interactive client components.
- Redux Toolkit is reserved for genuine global client UI state.
- Paystack is the payment provider.
- Vercel is the application host.

Business logic belongs in feature services, not presentation components. Financial transitions are server-authoritative. Each distinct screen receives its own App Router page.
