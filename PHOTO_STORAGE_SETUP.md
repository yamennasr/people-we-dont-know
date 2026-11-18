# Shared photo storage setup

The collage uses Supabase Storage so uploaded images are shared with everyone
visiting the site. The app uses a public browser key, so access is controlled by
the bucket policies below; never put a `service_role` or secret key in this site.

## Set up the free Supabase project

1. Create a Supabase project on the Free plan.
2. In the Supabase SQL Editor, run:

   ```sql
   insert into storage.buckets (id, name, public, file_size_limit)
   values ('collage', 'collage', true, 10485760)
   on conflict (id) do update
   set public = true, file_size_limit = 10485760;

   drop policy if exists "Anyone can view collage photos" on storage.objects;
   create policy "Anyone can view collage photos"
   on storage.objects for select to anon
   using (bucket_id = 'collage');

   drop policy if exists "Anyone can upload collage photos" on storage.objects;
   create policy "Anyone can upload collage photos"
   on storage.objects for insert to anon
   with check (bucket_id = 'collage');
   ```

   There is intentionally no anonymous update or delete policy. Anyone can
   upload images up to 10 MB, and anyone with a photo URL can view them.
3. In `static/photo-storage-config.js`, set `supabaseUrl` and `anonKey` from
   your project's API settings. Use the project's public anon/publishable key,
   not a service-role key. Keep `bucket` set to `collage`.
4. Deploy the site. New uploads appear first; the collage still renders only
   seven tiles. The expanded viewer's arrows navigate through all uploaded and
   original photos. A moderator can remove an upload from the `collage` bucket
   in the Supabase dashboard.

Supabase's Free plan currently includes 1 GB of file storage and 5 GB of
egress. Free projects may be paused after a week of inactivity, and service
quotas or plan terms can change. This keeps the project within the free tier
while usage stays within its limits, but does not provide unlimited storage or
an uptime/permanence guarantee.
