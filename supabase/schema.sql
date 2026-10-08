create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[a-z0-9_]{3,24}$'),
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username));

create table if not exists public.contacts (
  user_id uuid not null references public.profiles (id) on delete cascade,
  contact_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, contact_id),
  check (user_id <> contact_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (user_a < user_b),
  unique (user_a, user_b)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_created_at_idx
  on public.messages (conversation_id, created_at);

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Authenticated users can find profiles"
  on public.profiles;
create policy "Authenticated users can find profiles"
  on public.profiles for select to authenticated
  using (true);

drop policy if exists "Users can update their own profile"
  on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "Users can view their contacts"
  on public.contacts;
create policy "Users can view their contacts"
  on public.contacts for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Participants can view their conversations"
  on public.conversations;
create policy "Participants can view their conversations"
  on public.conversations for select to authenticated
  using (
    (select auth.uid()) = user_a
    or (select auth.uid()) = user_b
  );

drop policy if exists "Participants can view conversation messages"
  on public.messages;
create policy "Participants can view conversation messages"
  on public.messages for select to authenticated
  using (
    exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (
          c.user_a = (select auth.uid())
          or c.user_b = (select auth.uid())
        )
    )
  );

drop policy if exists "Participants can send messages"
  on public.messages;
create policy "Participants can send messages"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and (
          c.user_a = (select auth.uid())
          or c.user_b = (select auth.uid())
        )
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  candidate_username text;
begin
  candidate_username := regexp_replace(
    lower(coalesce(
        new.raw_user_meta_data ->> 'username',
        split_part(coalesce(new.email, ''), '@', 1)
      )),
      '[^a-z0-9_]',
      '',
      'g'
  );

  if char_length(candidate_username) < 3 then
    candidate_username := 'user_' || left(replace(new.id::text, '-', ''), 8);
  else
    candidate_username := left(candidate_username, 24);
  end if;

  begin
    insert into public.profiles (id, username, full_name, avatar_url)
    values (
      new.id,
      candidate_username,
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      new.raw_user_meta_data ->> 'avatar_url'
    );
  exception when unique_violation then
    insert into public.profiles (id, username, full_name, avatar_url)
    values (
      new.id,
      'u_' || left(replace(new.id::text, '-', ''), 22),
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      new.raw_user_meta_data ->> 'avatar_url'
    );
  end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

do $$
declare
  auth_user record;
  candidate_username text;
begin
  for auth_user in
    select id, email, raw_user_meta_data
    from auth.users
  loop
    if not exists (
      select 1 from public.profiles where id = auth_user.id
    ) then
      candidate_username := regexp_replace(
        lower(coalesce(
            auth_user.raw_user_meta_data ->> 'username',
            split_part(coalesce(auth_user.email, ''), '@', 1)
          )),
          '[^a-z0-9_]',
          '',
          'g'
      );

      if char_length(candidate_username) < 3 then
        candidate_username := 'user_' || left(replace(auth_user.id::text, '-', ''), 8);
      else
        candidate_username := left(candidate_username, 24);
      end if;

      begin
        insert into public.profiles (id, username, full_name, avatar_url)
        values (
          auth_user.id,
          candidate_username,
          coalesce(auth_user.raw_user_meta_data ->> 'full_name', ''),
          auth_user.raw_user_meta_data ->> 'avatar_url'
        );
      exception when unique_violation then
        insert into public.profiles (id, username, full_name, avatar_url)
        values (
          auth_user.id,
          'u_' || left(replace(auth_user.id::text, '-', ''), 22),
          coalesce(auth_user.raw_user_meta_data ->> 'full_name', ''),
          auth_user.raw_user_meta_data ->> 'avatar_url'
        );
      end;
    end if;
  end loop;
end;
$$;

create or replace function public.add_contact(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'You must be signed in to add a contact.';
  end if;
  if target_user_id = current_user_id then
    raise exception 'You cannot add yourself as a contact.';
  end if;
  if not exists (select 1 from public.profiles where id = target_user_id) then
    raise exception 'That user does not exist.';
  end if;

  insert into public.contacts (user_id, contact_id)
  values
    (current_user_id, target_user_id),
    (target_user_id, current_user_id)
  on conflict do nothing;
end;
$$;

create or replace function public.remove_contact(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'You must be signed in to remove a contact.';
  end if;

  delete from public.contacts
  where (user_id = current_user_id and contact_id = target_user_id)
     or (user_id = target_user_id and contact_id = current_user_id);
end;
$$;

create or replace function public.get_or_create_direct_conversation(target_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_user_id uuid := auth.uid();
  participant_a uuid;
  participant_b uuid;
  conversation_id uuid;
begin
  if current_user_id is null then
    raise exception 'You must be signed in to start a conversation.';
  end if;
  if target_user_id = current_user_id then
    raise exception 'You cannot start a conversation with yourself.';
  end if;
  if not exists (select 1 from public.profiles where id = target_user_id) then
    raise exception 'That user does not exist.';
  end if;

  participant_a := least(current_user_id, target_user_id);
  participant_b := greatest(current_user_id, target_user_id);

  insert into public.conversations (user_a, user_b)
  values (participant_a, participant_b)
  on conflict (user_a, user_b) do update
    set user_a = excluded.user_a
  returning id into conversation_id;

  return conversation_id;
end;
$$;

revoke all on function public.add_contact(uuid) from public;
revoke all on function public.remove_contact(uuid) from public;
revoke all on function public.get_or_create_direct_conversation(uuid) from public;
grant execute on function public.add_contact(uuid) to authenticated;
grant execute on function public.remove_contact(uuid) to authenticated;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

grant select, update on public.profiles to authenticated;
grant select on public.contacts to authenticated;
grant select on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;

do $$
begin
  if exists (
    select 1 from pg_publication where pubname = 'supabase_realtime'
  ) and not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;
