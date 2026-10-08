# Chat App

## Supabase setup

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the values from your Supabase project.
3. In the Supabase dashboard, open **SQL Editor**, create a query, paste in the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the profile, contact, conversation, and message tables; profile creation for Auth users; and row-level security policies.
4. In Supabase **Authentication → URL Configuration**, set the site URL to your local app URL (usually `http://localhost:5173`) for email confirmation links.
5. Run `npm run dev` and open the local URL printed by Vite. Restart Vite after changing environment variables.

The app uses Supabase Auth for email-and-password accounts. Registration stores the display name and username in Auth metadata and creates a searchable profile row. Contacts, direct conversations, and messages are stored in Supabase. Users must register separate accounts to message each other; demo contacts and local-only messages are no longer used.