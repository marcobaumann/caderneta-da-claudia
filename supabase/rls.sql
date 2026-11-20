-- RLS da Caderneta da Cláudia, escrito para o schema.sql do projeto.
-- Rode no SQL Editor do Supabase, depois de schema.sql e dados.sql.
--
-- Problema do schema: usuarios.usuario_id é INTEGER, mas auth.uid() devolve UUID.
-- Solução: ligar cada linha de usuarios a um login do Supabase Auth (coluna auth_id)
-- e usar uma função que converte "quem está logado" em usuario_id.

-- ---------------------------------------------------------------------------
-- 1) Ligação usuarios <-> auth.users
-- ---------------------------------------------------------------------------
alter table public.usuarios
  add column if not exists auth_id uuid unique references auth.users (id) on delete set null;

-- usuario_id do login atual (null se não estiver logado ou ainda sem vínculo).
-- security definer: lê usuarios sem depender das policies dessa própria tabela.
create or replace function public.usuario_id_atual()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select usuario_id from public.usuarios where auth_id = (select auth.uid())
$$;

revoke all on function public.usuario_id_atual() from public, anon;
grant execute on function public.usuario_id_atual() to authenticated;

-- ---------------------------------------------------------------------------
-- 2) Cria/vincula a linha de usuarios quando o e-mail é CONFIRMADO no Supabase Auth
--    - se já existe usuarios com esse e-mail (ex.: claudia@exemplo.com.br) e sem vínculo,
--      o login assume os dados dela;
--    - senão, cria um usuário novo.
--    Só age com e-mail confirmado: evita que alguém se cadastre com o e-mail de outra
--    pessoa e herde os dados dela. Mantenha "Confirm email" LIGADO no Supabase Auth
--    (para testar com os e-mails fictícios do dados.sql, crie o usuário pelo painel
--    do Supabase com "Auto Confirm User").
-- ---------------------------------------------------------------------------
create sequence if not exists public.usuarios_usuario_id_seq owned by public.usuarios.usuario_id;
select setval('public.usuarios_usuario_id_seq', coalesce((select max(usuario_id) from public.usuarios), 0) + 1, false);
alter table public.usuarios alter column usuario_id set default nextval('public.usuarios_usuario_id_seq');

create or replace function public.vincular_usuario_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  if exists (select 1 from public.usuarios where auth_id = new.id) then
    return new;
  end if;

  update public.usuarios
     set auth_id = new.id
   where lower(email) = lower(new.email)
     and auth_id is null;

  if not found then
    insert into public.usuarios (nome, email, senha_hash, criado_em, auth_id)
    values (
      coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
      new.email,
      'gerenciada-pelo-supabase-auth', -- senha_hash é NOT NULL, mas a senha real fica no Auth
      current_date,
      new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists vincular_usuario_auth_insert on auth.users;
create trigger vincular_usuario_auth_insert
  after insert on auth.users
  for each row execute function public.vincular_usuario_auth();

drop trigger if exists vincular_usuario_auth_confirmacao on auth.users;
create trigger vincular_usuario_auth_confirmacao
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.vincular_usuario_auth();

-- ---------------------------------------------------------------------------
-- 3) Liga o RLS (sem policy, ninguém lê nem escreve nada)
-- ---------------------------------------------------------------------------
alter table public.usuarios     enable row level security;
alter table public.contas       enable row level security;
alter table public.categorias   enable row level security;
alter table public.recorrencias enable row level security;
alter table public.lancamentos  enable row level security;

-- ---------------------------------------------------------------------------
-- 4) usuarios: cada pessoa lê e atualiza só a própria linha
--    (sem insert/delete pelo app: a linha nasce pelo trigger acima)
-- ---------------------------------------------------------------------------
create policy "usuarios_select_proprio" on public.usuarios
  for select to authenticated
  using (usuario_id = public.usuario_id_atual());

create policy "usuarios_update_proprio" on public.usuarios
  for update to authenticated
  using (usuario_id = public.usuario_id_atual())
  with check (usuario_id = public.usuario_id_atual());

-- ---------------------------------------------------------------------------
-- 5) contas, categorias, recorrencias, lancamentos: leitura e escrita só do dono
--    As FKs compostas (conta_id, usuario_id) e (categoria_id, usuario_id) já impedem
--    apontar para conta/categoria de outra pessoa.
-- ---------------------------------------------------------------------------
-- lancamentos
create policy "lancamentos_select_proprios" on public.lancamentos
  for select to authenticated
  using (usuario_id = public.usuario_id_atual());
create policy "lancamentos_insert_proprios" on public.lancamentos
  for insert to authenticated
  with check (usuario_id = public.usuario_id_atual());
create policy "lancamentos_update_proprios" on public.lancamentos
  for update to authenticated
  using (usuario_id = public.usuario_id_atual())
  with check (usuario_id = public.usuario_id_atual());
create policy "lancamentos_delete_proprios" on public.lancamentos
  for delete to authenticated
  using (usuario_id = public.usuario_id_atual());

-- categorias (também necessária para o nome da categoria aparecer no join da listagem)
create policy "categorias_select_proprias" on public.categorias
  for select to authenticated
  using (usuario_id = public.usuario_id_atual());
create policy "categorias_insert_proprias" on public.categorias
  for insert to authenticated
  with check (usuario_id = public.usuario_id_atual());
create policy "categorias_update_proprias" on public.categorias
  for update to authenticated
  using (usuario_id = public.usuario_id_atual())
  with check (usuario_id = public.usuario_id_atual());
create policy "categorias_delete_proprias" on public.categorias
  for delete to authenticated
  using (usuario_id = public.usuario_id_atual());

-- contas
create policy "contas_select_proprias" on public.contas
  for select to authenticated
  using (usuario_id = public.usuario_id_atual());
create policy "contas_insert_proprias" on public.contas
  for insert to authenticated
  with check (usuario_id = public.usuario_id_atual());
create policy "contas_update_proprias" on public.contas
  for update to authenticated
  using (usuario_id = public.usuario_id_atual())
  with check (usuario_id = public.usuario_id_atual());
create policy "contas_delete_proprias" on public.contas
  for delete to authenticated
  using (usuario_id = public.usuario_id_atual());

-- recorrencias
create policy "recorrencias_select_proprias" on public.recorrencias
  for select to authenticated
  using (usuario_id = public.usuario_id_atual());
create policy "recorrencias_insert_proprias" on public.recorrencias
  for insert to authenticated
  with check (usuario_id = public.usuario_id_atual());
create policy "recorrencias_update_proprias" on public.recorrencias
  for update to authenticated
  using (usuario_id = public.usuario_id_atual())
  with check (usuario_id = public.usuario_id_atual());
create policy "recorrencias_delete_proprias" on public.recorrencias
  for delete to authenticated
  using (usuario_id = public.usuario_id_atual());

-- ---------------------------------------------------------------------------
-- 6) Opcional, para o app poder inserir: ids automáticos e usuario_id preenchido sozinho.
--    (As PKs do schema são INTEGER sem default; os dados do dados.sql têm ids explícitos.)
-- ---------------------------------------------------------------------------
do $$
declare
  t record;
begin
  for t in
    select * from (values
      ('contas', 'conta_id'),
      ('categorias', 'categoria_id'),
      ('recorrencias', 'recorrencia_id'),
      ('lancamentos', 'lancamento_id')
    ) as v(tabela, pk)
  loop
    execute format('create sequence if not exists public.%I_%I_seq owned by public.%I.%I',
                   t.tabela, t.pk, t.tabela, t.pk);
    execute format('select setval(%L, coalesce((select max(%I) from public.%I), 0) + 1, false)',
                   'public.' || t.tabela || '_' || t.pk || '_seq', t.pk, t.tabela);
    execute format('alter table public.%I alter column %I set default nextval(%L)',
                   t.tabela, t.pk, 'public.' || t.tabela || '_' || t.pk || '_seq');
    execute format('alter table public.%I alter column usuario_id set default public.usuario_id_atual()',
                   t.tabela);
  end loop;
end $$;
