create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  description text not null,
  amount numeric not null,
  category varchar default '未分類',
  created_at timestamptz default now()
);

alter table public.expenses enable row level security;

create policy "使用者只能看自己的帳目"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "使用者只能新增自己的帳目"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "使用者只能刪除自己的帳目"
  on public.expenses for delete
  using (auth.uid() = user_id);

create policy "使用者只能更新自己的帳目"
  on public.expenses for update
  using (auth.uid() = user_id);
