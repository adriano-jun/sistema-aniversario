-- ================================
-- SCHEMA: Convite Digital Maria Alice
-- Execute este SQL no Supabase SQL Editor
-- ================================

-- Tabela de eventos
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  nome_evento text not null,
  tema text default 'jardim-encantado',
  nome_aniversariante text,
  idade integer,
  data date,
  horario_inicio time,
  horario_fim time,
  local_nome text,
  endereco_completo text,
  link_maps text,
  chave_pix text,
  data_limite_confirmacao date,
  link_presente text,
  slug text unique not null,
  created_at timestamptz default now()
);

-- Tabela de RSVPs
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  nome_convidado text not null,
  qtd_adultos integer default 1,
  qtd_criancas integer default 0,
  idades_criancas jsonb default '[]',
  restricoes text,
  alergias text,
  bebe_colo boolean default false,
  created_at timestamptz default now()
);

-- Habilitar RLS
alter table events enable row level security;
alter table rsvps enable row level security;

-- Políticas: Events
create policy "Usuários gerenciam próprios eventos"
  on events for all
  using (auth.uid() = user_id);

create policy "Leitura pública de evento por slug"
  on events for select
  using (true);

-- Políticas: RSVPs
create policy "Inserção pública de RSVP"
  on rsvps for insert
  with check (true);

create policy "Dono lê RSVPs do seu evento"
  on rsvps for select
  using (
    exists (
      select 1 from events
      where events.id = rsvps.event_id
        and events.user_id = auth.uid()
    )
  );

create policy "Dono exclui RSVPs do seu evento"
  on rsvps for delete
  using (
    exists (
      select 1 from events
      where events.id = rsvps.event_id
        and events.user_id = auth.uid()
    )
  );
