# Zagamart

Zagamart is a secure peer-to-peer student marketplace, initially designed for Delta State University (DELSU), Abraka.

This repository contains the Next.js rebuild of the original DelsuMart platform.

## Planned stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage, Row Level Security)
- TanStack Query
- Redux Toolkit for client-only global state
- React Hook Form + Zod
- Paystack
- Vitest + React Testing Library + Playwright
- Vercel

## Engineering standards

The codebase is feature-oriented, uses Server Components by default, keeps business logic outside presentation components, and gives each distinct application screen its own route. Components are kept focused and must never exceed 800 lines.

## Status

Initial architecture and foundation are being established incrementally. Core functionality will not be represented as complete until its UI, server logic, authorization, validation, security controls, and tests are implemented.
