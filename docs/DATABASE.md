# Database Design

Supabase PostgreSQL is authoritative. Supabase Auth owns credentials; profiles reference auth.users IDs.

Money is stored as integer minor units (kobo).

Core domains: profiles, student verification, listings, listing images, transactions, disputes, fraud flags, payment events, bank accounts, payout requests, system settings, notifications, and audit logs.

Schema changes live under supabase/migrations. RLS is treated as part of the security boundary.
