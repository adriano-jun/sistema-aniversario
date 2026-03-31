-- ================================================
-- MIGRATION: Colaboradores por Evento
-- Execute este SQL no Supabase SQL Editor
-- ================================================

-- Tabela de colaboradores
create table if not exists event_collaborators (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade not null,
  invited_email text not null,
  role text default 'editor' check (role in ('editor', 'viewer')),
  created_at timestamptz default now(),
  unique(event_id, invited_email)
);

-- Habilitar RLS
alter table event_collaborators enable row level security;

-- Dono do evento gerencia colaboradores
create policy "Dono gerencia colaboradores"
  on event_collaborators for all
  using (
    exists (
      select 1 from events
      where events.id = event_collaborators.event_id
        and events.user_id = auth.uid()
    )
  );

-- Colaboradores veem a própria entrada
create policy "Colaborador vê própria entrada"
  on event_collaborators for select
  using (invited_email = auth.email());

-- ------------------------------------------------
-- Atualizar política de UPDATE em events para colaboradores
-- (a política "Users manage own events" já cobre o dono)
-- ------------------------------------------------

create policy "Colaboradores editor podem atualizar evento"
  on events for update
  using (
    exists (
      select 1 from event_collaborators
      where event_collaborators.event_id = events.id
        and event_collaborators.invited_email = auth.email()
        and event_collaborators.role = 'editor'
    )
  );

-- ------------------------------------------------
-- Atualizar política de RSVPs para incluir colaboradores
-- ------------------------------------------------

-- Dropar política antiga de leitura de RSVPs
drop policy if exists "Dono lê RSVPs do seu evento" on rsvps;

-- Nova política: dono E colaboradores leem RSVPs
create policy "Dono e colaboradores leem RSVPs"
  on rsvps for select
  using (
    exists (
      select 1 from events
      where events.id = rsvps.event_id
        and (
          events.user_id = auth.uid()
          or exists (
            select 1 from event_collaborators
            where event_collaborators.event_id = events.id
              and event_collaborators.invited_email = auth.email()
          )
        )
    )
  );

-- Colaboradores editor podem deletar RSVPs
create policy "Colaboradores editor deletam RSVPs"
  on rsvps for delete
  using (
    exists (
      select 1 from events
      join event_collaborators on event_collaborators.event_id = events.id
      where events.id = rsvps.event_id
        and event_collaborators.invited_email = auth.email()
        and event_collaborators.role = 'editor'
    )
  );
