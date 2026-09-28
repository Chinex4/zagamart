# Deployment

Zagamart targets Vercel with Supabase as its managed backend.

Production secrets belong in Vercel/Supabase configuration and must never be committed. See .env.example for variable names.

Database migrations must be applied deliberately before dependent application features are released.
