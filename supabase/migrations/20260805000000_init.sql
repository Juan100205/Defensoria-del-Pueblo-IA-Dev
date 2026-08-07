-- =============================================================
-- Defensoría del Pueblo — Esquema inicial (Supabase/PostgreSQL)
-- Generado a partir del análisis del frontend (Vite + React + TS)
-- No ejecutar contra el proyecto remoto hasta su revisión.
-- =============================================================

-- ---------------------------------------------------------------
-- 1. Enums (valores extraídos de src/data/constants.ts)
-- ---------------------------------------------------------------
create type public.app_role as enum ('administrador', 'coordinador', 'analista', 'consulta');

create type public.solicitud_estado as enum ('Recibida', 'En análisis', 'Asignada', 'En trámite', 'Finalizada');

create type public.solicitud_urgencia as enum ('Alta', 'Media', 'Baja');

create type public.solicitud_tipo as enum ('Petición', 'Queja', 'Reclamo', 'Sugerencia', 'Denuncia DDHH', 'Tutela');

create type public.solicitud_tema as enum (
  'Salud',
  'Servicios públicos',
  'Víctimas del conflicto',
  'Población migrante',
  'Educación',
  'Trabajo',
  'Vivienda',
  'Niñez y adolescencia',
  'Personas privadas de la libertad',
  'Medio ambiente'
);

-- ---------------------------------------------------------------
-- 2. Tablas de referencia
-- ---------------------------------------------------------------
create table public.departamentos (
  id bigint generated always as identity primary key,
  nombre text not null unique,
  created_at timestamptz not null default now()
);

create table public.municipios (
  id bigint generated always as identity primary key,
  departamento_id bigint not null references public.departamentos (id) on delete cascade,
  nombre text not null,
  created_at timestamptz not null default now(),
  unique (departamento_id, nombre)
);

create table public.dependencias (
  id bigint generated always as identity primary key,
  nombre text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 3. Perfiles (integración con auth.users)
-- ---------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text,
  role public.app_role not null default 'consulta',
  dependencia_id bigint references public.dependencias (id) on delete set null,
  active boolean not null default true,
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 4. Solicitudes (entidad principal)
-- ---------------------------------------------------------------
create table public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  radicado text not null unique,
  nombre_ciudadano text not null,
  tipo_documento text not null default 'C.C.',
  numero_documento text not null,
  correo text,
  telefono text,
  departamento_id bigint references public.departamentos (id) on delete set null,
  municipio_id bigint references public.municipios (id) on delete set null,
  ciudad text,
  tipo public.solicitud_tipo not null,
  tema public.solicitud_tema,
  asunto text,
  descripcion text,
  estado public.solicitud_estado not null default 'Recibida',
  urgencia public.solicitud_urgencia not null default 'Media',
  dependencia_id bigint references public.dependencias (id) on delete set null,
  funcionario_id uuid references public.profiles (id) on delete set null,
  fecha_radicacion date not null default current_date,
  fecha_vencimiento date,
  resumen_ia text,
  tags text[],
  duplicado_de uuid references public.solicitudes (id) on delete set null,
  sensible boolean not null default false,
  consentimiento boolean not null default false,
  canal text not null default 'chatbot',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint solicitudes_consentimiento check (consentimiento = true)
);

-- ---------------------------------------------------------------
-- 5. Archivos adjuntos (metadatos; binarios en Storage)
-- ---------------------------------------------------------------
create table public.solicitud_archivos (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes (id) on delete cascade,
  nombre_original text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 6. Historial de estados (cronología)
-- ---------------------------------------------------------------
create table public.estado_historial (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes (id) on delete cascade,
  estado_anterior public.solicitud_estado,
  estado_nuevo public.solicitud_estado not null,
  usuario_id uuid references public.profiles (id) on delete set null,
  comentario text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 7. Comentarios del expediente
-- ---------------------------------------------------------------
create table public.comentarios (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes (id) on delete cascade,
  autor_id uuid references public.profiles (id) on delete set null,
  cuerpo text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 8. Notificaciones del equipo
-- ---------------------------------------------------------------
create table public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles (id) on delete cascade,
  tipo text not null,
  titulo text not null,
  detalle text,
  leida boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 9. Alertas automáticas
-- ---------------------------------------------------------------
create table public.alertas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  severidad text not null default 'info',
  titulo text not null,
  descripcion text,
  solicitud_id uuid references public.solicitudes (id) on delete set null,
  atendida boolean not null default false,
  created_at timestamptz not null default now(),
  constraint alertas_severidad check (severidad in ('alta', 'media', 'info'))
);

-- ---------------------------------------------------------------
-- 10. Encuestas de satisfacción
-- ---------------------------------------------------------------
create table public.encuestas (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes (id) on delete cascade,
  calificacion smallint not null check (calificacion between 1 and 5),
  comentario text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 11. Exportaciones e informes programados
-- ---------------------------------------------------------------
create table public.exportaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles (id) on delete cascade,
  formato text not null check (formato in ('Excel', 'PDF', 'CSV')),
  fecha_inicio date,
  fecha_fin date,
  contenido jsonb,
  storage_path text,
  created_at timestamptz not null default now()
);

create table public.informes_programados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  frecuencia text not null,
  formato text not null check (formato in ('Excel', 'PDF', 'CSV')),
  dependencia_id bigint references public.dependencias (id) on delete set null,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 12. Configuración (toggles de ConfiguracionView)
-- ---------------------------------------------------------------
create table public.configuracion (
  id bigint generated always as identity primary key,
  grupo text not null,
  clave text not null,
  descripcion text,
  valor boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (grupo, clave)
);

-- ---------------------------------------------------------------
-- 13. Índices
-- ---------------------------------------------------------------
create index idx_municipios_departamento on public.municipios (departamento_id);
create index idx_profiles_role on public.profiles (role);
create index idx_profiles_dependencia on public.profiles (dependencia_id);

create index idx_solicitudes_estado on public.solicitudes (estado);
create index idx_solicitudes_urgencia on public.solicitudes (urgencia);
create index idx_solicitudes_tipo on public.solicitudes (tipo);
create index idx_solicitudes_tema on public.solicitudes (tema);
create index idx_solicitudes_departamento on public.solicitudes (departamento_id);
create index idx_solicitudes_municipio on public.solicitudes (municipio_id);
create index idx_solicitudes_dependencia on public.solicitudes (dependencia_id);
create index idx_solicitudes_funcionario on public.solicitudes (funcionario_id);
create index idx_solicitudes_fecha on public.solicitudes (fecha_radicacion desc);
create index idx_solicitudes_duplicado_de on public.solicitudes (duplicado_de);

create index idx_solicitud_archivos_solicitud on public.solicitud_archivos (solicitud_id);
create index idx_estado_historial_solicitud on public.estado_historial (solicitud_id);
create index idx_comentarios_solicitud on public.comentarios (solicitud_id);
create index idx_notificaciones_usuario on public.notificaciones (usuario_id);
create index idx_notificaciones_leida on public.notificaciones (leida);
create index idx_alertas_atendida on public.alertas (atendida);
create index idx_alertas_solicitud on public.alertas (solicitud_id);
create index idx_encuestas_solicitud on public.encuestas (solicitud_id);
create index idx_exportaciones_usuario on public.exportaciones (usuario_id);
create index idx_informes_dependencia on public.informes_programados (dependencia_id);
create index idx_configuracion_grupo on public.configuracion (grupo);

-- ---------------------------------------------------------------
-- 14. Trigger de updated_at genérico
-- ---------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger solicitudes_set_updated_at before update on public.solicitudes
for each row execute function public.set_updated_at();

create trigger informes_set_updated_at before update on public.informes_programados
for each row execute function public.set_updated_at();

create trigger configuracion_set_updated_at before update on public.configuracion
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------
-- 15. Perfil automático al crear un usuario de auth
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------
-- 16. Funciones auxiliares para RLS (sin recursión)
-- ---------------------------------------------------------------
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_profile_dependencia()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select dependencia_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and active = true
  );
$$;

-- ---------------------------------------------------------------
-- 17. Función de consulta pública de radicado (security definer)
-- ---------------------------------------------------------------
create or replace function public.consultar_radicado(p_radicado text, p_documento text)
returns table (
  radicado text,
  estado public.solicitud_estado,
  urgencia public.solicitud_urgencia,
  tipo public.solicitud_tipo,
  tema public.solicitud_tema,
  asunto text,
  dependencia text,
  municipio text,
  departamento text,
  fecha_radicacion date,
  fecha_vencimiento date
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    s.radicado,
    s.estado,
    s.urgencia,
    s.tipo,
    s.tema,
    s.asunto,
    d.nombre as dependencia,
    m.nombre as municipio,
    dp.nombre as departamento,
    s.fecha_radicacion,
    s.fecha_vencimiento
  from public.solicitudes s
  left join public.dependencias d on d.id = s.dependencia_id
  left join public.municipios m on m.id = s.municipio_id
  left join public.departamentos dp on dp.id = s.departamento_id
  where s.radicado = p_radicado
    and lower(s.numero_documento) = lower(p_documento);
end;
$$;

revoke all on function public.consultar_radicado(text, text) from public;
grant execute on function public.consultar_radicado(text, text) to anon, authenticated;

-- ---------------------------------------------------------------
-- 18. Row Level Security
-- ---------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.departamentos enable row level security;
alter table public.municipios enable row level security;
alter table public.dependencias enable row level security;
alter table public.solicitudes enable row level security;
alter table public.solicitud_archivos enable row level security;
alter table public.estado_historial enable row level security;
alter table public.comentarios enable row level security;
alter table public.notificaciones enable row level security;
alter table public.alertas enable row level security;
alter table public.encuestas enable row level security;
alter table public.exportaciones enable row level security;
alter table public.informes_programados enable row level security;
alter table public.configuracion enable row level security;

-- ---------------------------------------------------------------
-- 18.1 Políticas: perfiles
-- ---------------------------------------------------------------
create policy "profiles_select_own_or_staff"
on public.profiles for select
using (
  id = auth.uid() or public.is_staff()
);

create policy "profiles_insert_admin"
on public.profiles for insert
with check (public.current_app_role() = 'administrador');

create policy "profiles_update_admin"
on public.profiles for update
using (public.current_app_role() = 'administrador')
with check (public.current_app_role() = 'administrador');

create policy "profiles_delete_admin"
on public.profiles for delete
using (public.current_app_role() = 'administrador');

-- ---------------------------------------------------------------
-- 18.2 Políticas: tablas de referencia
-- ---------------------------------------------------------------
create policy "referencia_select_staff"
on public.departamentos for select
using (public.is_staff());

create policy "referencia_select_staff"
on public.municipios for select
using (public.is_staff());

create policy "referencia_select_staff"
on public.dependencias for select
using (public.is_staff());

-- ---------------------------------------------------------------
-- 18.3 Políticas: solicitudes
-- ---------------------------------------------------------------
-- El ciudadano anónimo radica sin sesión (exige consentimiento Ley 1581).
create policy "solicitudes_insert_anon_con_consentimiento"
on public.solicitudes for insert
to anon
with check (consentimiento = true);

create policy "solicitudes_insert_staff"
on public.solicitudes for insert
to authenticated
with check (public.is_staff());

-- Lectura: administrador, coordinador y consulta ven todo; analista solo su dependencia.
create policy "solicitudes_select_jefaturas_y_consulta"
on public.solicitudes for select
using (public.current_app_role() in ('administrador', 'coordinador', 'consulta'));

create policy "solicitudes_select_analista_dependencia"
on public.solicitudes for select
using (
  public.current_app_role() = 'analista'
  and dependencia_id = public.current_profile_dependencia()
);

-- Actualización: analista solo sus asignadas; coordinador en su dependencia; admin todo.
create policy "solicitudes_update_analista_asignadas"
on public.solicitudes for update
using (public.current_app_role() = 'analista' and funcionario_id = auth.uid())
with check (
  public.current_app_role() = 'analista'
  and funcionario_id = auth.uid()
  and dependencia_id = public.current_profile_dependencia()
);

create policy "solicitudes_update_coordinador_dependencia"
on public.solicitudes for update
using (
  public.current_app_role() = 'coordinador'
  and dependencia_id = public.current_profile_dependencia()
)
with check (
  public.current_app_role() = 'coordinador'
  and dependencia_id = public.current_profile_dependencia()
);

create policy "solicitudes_update_administrador"
on public.solicitudes for update
using (public.current_app_role() = 'administrador')
with check (public.current_app_role() = 'administrador');

create policy "solicitudes_delete_administrador"
on public.solicitudes for delete
using (public.current_app_role() = 'administrador');

-- ---------------------------------------------------------------
-- 18.4 Políticas: archivos adjuntos
-- ---------------------------------------------------------------
create policy "archivos_insert_anon"
on public.solicitud_archivos for insert
to anon
with check (true);

create policy "archivos_select_jefaturas_y_consulta"
on public.solicitud_archivos for select
using (public.current_app_role() in ('administrador', 'coordinador', 'consulta'));

create policy "archivos_select_analista_dependencia"
on public.solicitud_archivos for select
using (
  public.current_app_role() = 'analista'
  and exists (
    select 1 from public.solicitudes s
    where s.id = solicitud_id and s.dependencia_id = public.current_profile_dependencia()
  )
);

create policy "archivos_update_admin"
on public.solicitud_archivos for update
using (public.current_app_role() = 'administrador')
with check (public.current_app_role() = 'administrador');

create policy "archivos_delete_admin"
on public.solicitud_archivos for delete
using (public.current_app_role() = 'administrador');

-- ---------------------------------------------------------------
-- 18.5 Políticas: historial de estados
-- ---------------------------------------------------------------
create policy "historial_select_jefaturas_y_consulta"
on public.estado_historial for select
using (public.current_app_role() in ('administrador', 'coordinador', 'consulta'));

create policy "historial_select_analista_dependencia"
on public.estado_historial for select
using (
  public.current_app_role() = 'analista'
  and exists (
    select 1 from public.solicitudes s
    where s.id = solicitud_id and s.dependencia_id = public.current_profile_dependencia()
  )
);

create policy "historial_insert_analista_asignadas"
on public.estado_historial for insert
with check (
  public.current_app_role() = 'analista'
  and exists (
    select 1 from public.solicitudes s
    where s.id = solicitud_id and s.funcionario_id = auth.uid()
  )
);

create policy "historial_insert_coordinador_dependencia"
on public.estado_historial for insert
with check (
  public.current_app_role() = 'coordinador'
  and exists (
    select 1 from public.solicitudes s
    where s.id = solicitud_id and s.dependencia_id = public.current_profile_dependencia()
  )
);

create policy "historial_insert_administrador"
on public.estado_historial for insert
with check (public.current_app_role() = 'administrador');

create policy "historial_delete_admin"
on public.estado_historial for delete
using (public.current_app_role() = 'administrador');

-- ---------------------------------------------------------------
-- 18.6 Políticas: comentarios
-- ---------------------------------------------------------------
create policy "comentarios_select_jefaturas_y_consulta"
on public.comentarios for select
using (public.current_app_role() in ('administrador', 'coordinador', 'consulta'));

create policy "comentarios_select_analista_dependencia"
on public.comentarios for select
using (
  public.current_app_role() = 'analista'
  and exists (
    select 1 from public.solicitudes s
    where s.id = solicitud_id and s.dependencia_id = public.current_profile_dependencia()
  )
);

create policy "comentarios_insert_analista_asignadas"
on public.comentarios for insert
with check (
  public.current_app_role() = 'analista'
  and exists (
    select 1 from public.solicitudes s
    where s.id = solicitud_id and s.funcionario_id = auth.uid()
  )
);

create policy "comentarios_insert_coordinador_dependencia"
on public.comentarios for insert
with check (
  public.current_app_role() = 'coordinador'
  and exists (
    select 1 from public.solicitudes s
    where s.id = solicitud_id and s.dependencia_id = public.current_profile_dependencia()
  )
);

create policy "comentarios_insert_administrador"
on public.comentarios for insert
with check (public.current_app_role() = 'administrador');

create policy "comentarios_delete_admin"
on public.comentarios for delete
using (public.current_app_role() = 'administrador');

-- ---------------------------------------------------------------
-- 18.7 Políticas: notificaciones
-- ---------------------------------------------------------------
create policy "notificaciones_select_own"
on public.notificaciones for select
using (usuario_id = auth.uid());

create policy "notificaciones_insert_staff"
on public.notificaciones for insert
with check (public.is_staff());

create policy "notificaciones_update_own"
on public.notificaciones for update
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());

create policy "notificaciones_delete_own_or_admin"
on public.notificaciones for delete
using (usuario_id = auth.uid() or public.current_app_role() = 'administrador');

-- ---------------------------------------------------------------
-- 18.8 Políticas: alertas
-- ---------------------------------------------------------------
create policy "alertas_select_staff"
on public.alertas for select
using (public.is_staff());

create policy "alertas_update_coordinador_admin"
on public.alertas for update
using (public.current_app_role() in ('coordinador', 'administrador'))
with check (public.current_app_role() in ('coordinador', 'administrador'));

create policy "alertas_delete_admin"
on public.alertas for delete
using (public.current_app_role() = 'administrador');

-- ---------------------------------------------------------------
-- 18.9 Políticas: encuestas
-- ---------------------------------------------------------------
create policy "encuestas_insert_anon"
on public.encuestas for insert
to anon
with check (true);

create policy "encuestas_select_jefaturas_y_consulta"
on public.encuestas for select
using (public.current_app_role() in ('administrador', 'coordinador', 'consulta'));

create policy "encuestas_select_analista_dependencia"
on public.encuestas for select
using (
  public.current_app_role() = 'analista'
  and exists (
    select 1 from public.solicitudes s
    where s.id = solicitud_id and s.dependencia_id = public.current_profile_dependencia()
  )
);

create policy "encuestas_delete_admin"
on public.encuestas for delete
using (public.current_app_role() = 'administrador');

-- ---------------------------------------------------------------
-- 18.10 Políticas: exportaciones
-- ---------------------------------------------------------------
create policy "exportaciones_select_own_or_admin"
on public.exportaciones for select
using (usuario_id = auth.uid() or public.current_app_role() = 'administrador');

create policy "exportaciones_insert_own"
on public.exportaciones for insert
with check (usuario_id = auth.uid() and public.is_staff());

create policy "exportaciones_delete_own_or_admin"
on public.exportaciones for delete
using (usuario_id = auth.uid() or public.current_app_role() = 'administrador');

-- ---------------------------------------------------------------
-- 18.11 Políticas: informes programados
-- ---------------------------------------------------------------
create policy "informes_select_staff"
on public.informes_programados for select
using (public.is_staff());

create policy "informes_insert_coordinador_admin"
on public.informes_programados for insert
with check (public.current_app_role() in ('coordinador', 'administrador'));

create policy "informes_update_coordinador_admin"
on public.informes_programados for update
using (public.current_app_role() in ('coordinador', 'administrador'))
with check (public.current_app_role() in ('coordinador', 'administrador'));

create policy "informes_delete_admin"
on public.informes_programados for delete
using (public.current_app_role() = 'administrador');

-- ---------------------------------------------------------------
-- 18.12 Políticas: configuración
-- ---------------------------------------------------------------
create policy "configuracion_select_staff"
on public.configuracion for select
using (public.is_staff());

create policy "configuracion_insert_admin"
on public.configuracion for insert
with check (public.current_app_role() = 'administrador');

create policy "configuracion_update_admin"
on public.configuracion for update
using (public.current_app_role() = 'administrador')
with check (public.current_app_role() = 'administrador');

create policy "configuracion_delete_admin"
on public.configuracion for delete
using (public.current_app_role() = 'administrador');

-- ---------------------------------------------------------------
-- 19. Storage: bucket privado para adjuntos
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'solicitudes-adjuntos',
  'solicitudes-adjuntos',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;

-- El ciudadano anónimo solo puede subir a la carpeta "pendientes/" (aún sin radicado).
create policy "adjuntos_insert_anon_pendientes"
on storage.objects for insert
to anon
with check (
  bucket_id = 'solicitudes-adjuntos'
  and (storage.foldername(name))[1] = 'pendientes'
);

-- El personal interno gestiona los adjuntos (mover de pendientes/ al expediente).
create policy "adjuntos_insert_staff"
on storage.objects for insert
to authenticated
with check (bucket_id = 'solicitudes-adjuntos' and public.is_staff());

create policy "adjuntos_select_staff"
on storage.objects for select
to authenticated
using (bucket_id = 'solicitudes-adjuntos' and public.is_staff());

create policy "adjuntos_update_staff"
on storage.objects for update
to authenticated
using (bucket_id = 'solicitudes-adjuntos' and public.is_staff())
with check (bucket_id = 'solicitudes-adjuntos' and public.is_staff());

create policy "adjuntos_delete_staff"
on storage.objects for delete
to authenticated
using (bucket_id = 'solicitudes-adjuntos' and public.is_staff());

-- ---------------------------------------------------------------
-- 20. Datos iniciales de referencia (catálogos del frontend)
-- ---------------------------------------------------------------
insert into public.departamentos (nombre) values
  ('Antioquia'), ('Bogotá D.C.'), ('Valle del Cauca'), ('Atlántico'), ('Santander'),
  ('Nariño'), ('Bolívar'), ('Cundinamarca'), ('Norte de Santander'), ('Chocó'),
  ('Cauca'), ('Magdalena'), ('Córdoba'), ('Huila'), ('Meta'), ('Amazonas')
on conflict (nombre) do nothing;

insert into public.dependencias (nombre) values
  ('Dirección Nacional'),
  ('Oficina de Planeación'),
  ('Delegada para la Salud'),
  ('Delegada para Víctimas'),
  ('Regional Antioquia'),
  ('Regional Valle'),
  ('Regional Atlántico'),
  ('Regional Nariño'),
  ('Regional Chocó')
on conflict (nombre) do nothing;

insert into public.configuracion (grupo, clave, descripcion, valor) values
  ('asistente_radicacion', 'saludo_con_nombre', 'Saludo con nombre del ciudadano', true),
  ('asistente_radicacion', 'permitir_corregir', 'Permitir corregir respuestas anteriores', true),
  ('asistente_radicacion', 'adjuntos_obligatorios_ddhh', 'Adjuntos obligatorios en denuncias DDHH', false),
  ('asistente_radicacion', 'encuesta_satisfaccion', 'Encuesta de satisfacción al finalizar', true),
  ('priorizacion', 'menores_edad', 'Menores de edad involucrados', true),
  ('priorizacion', 'adulto_mayor_salud', 'Adulto mayor con caso en salud', true),
  ('priorizacion', 'riesgo_vital', 'Palabras de riesgo vital en el relato', true),
  ('priorizacion', 'alerta_temprana', 'Municipio con alerta temprana vigente', true),
  ('priorizacion', 'reincidencia', 'Reincidencia del mismo ciudadano', false),
  ('notificaciones', 'recordatorio_3_dias', 'Recordatorio a 3 días del vencimiento', true),
  ('notificaciones', 'escalamiento_al_vencer', 'Escalamiento automático al vencer', true),
  ('notificaciones', 'notificar_ciudadano_cambios', 'Notificar al ciudadano en cada cambio de estado', true),
  ('notificaciones', 'resumen_diario_coordinadores', 'Resumen diario para coordinadores', false),
  ('identidad', 'alto_contraste', 'Modo de alto contraste', false),
  ('identidad', 'fuente_base', 'Aumentar tamaño de fuente base', false),
  ('identidad', 'lectura_facil_chatbot', 'Lectura fácil en el chatbot', true),
  ('identidad', 'marca_exportaciones', 'Marca institucional en exportaciones', true)
on conflict (grupo, clave) do nothing;
