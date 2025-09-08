/*
  # Chat schema: conversations and messages

  1. New Tables
    - conversations
      - id (uuid, pk)
      - user_id (uuid, fk -> auth.users)
      - title (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    - messages
      - id (uuid, pk)
      - conversation_id (uuid, fk -> conversations.id on delete cascade)
      - user_id (uuid, fk -> auth.users)
      - role (text check in ('user','assistant','system'))
      - content (text)
      - created_at (timestamptz)

  2. Security
    - Enable RLS and add policies to allow users to access only their rows
*/

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table conversations enable row level security;

create policy "Users manage own conversations"
  on conversations for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_conversations_updated_at on conversations;
create trigger set_conversations_updated_at
  before update on conversations
  for each row execute function public.set_updated_at();

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

-- Users can see messages only in their conversations
create policy "Users read messages in own conversations"
  on messages for select
  to authenticated
  using (
    exists(
      select 1 from conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

-- Insert/update/delete restricted to own conversations
create policy "Users modify messages in own conversations"
  on messages for all
  to authenticated
  using (
    exists(
      select 1 from conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists(
      select 1 from conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

create index if not exists idx_conversations_user_id on conversations(user_id);
create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_messages_created_at on messages(created_at desc);

