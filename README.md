# Chat App

## Supabase setup

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the values from your Supabase project.
3. In the Supabase dashboard, open **SQL Editor**, create a query, paste in the contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the profile, contact, conversation, and message tables; profile creation for Auth users; and row-level security policies.
4. In Supabase **Authentication → URL Configuration**, set the site URL to your local app URL (usually `http://localhost:5173`) for email confirmation links.
5. Run `npm run dev` and open the local URL printed by Vite. Restart Vite after changing environment variables.

The app uses Supabase Auth for email-and-password accounts. Registration stores the display name and username in Auth metadata and creates a searchable profile row. Contacts, direct conversations, and messages are stored in Supabase. Users must register separate accounts to message each other; demo contacts and local-only messages are no longer used.

## Deploy to Netlify

1. Import this GitHub repository into Netlify.
2. Use `npm run build` as the build command and `dist` as the publish directory.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the Netlify site's environment variables. Use the same values as `.env.local`; never add a Supabase secret or service-role key.
4. Deploy the site, then add its Netlify URL to Supabase **Authentication → URL Configuration → Redirect URLs** and set the production site URL there.

The `public/_redirects` file configures the fallback required by React Router when a deployed route such as `/chat` is opened directly or refreshed.