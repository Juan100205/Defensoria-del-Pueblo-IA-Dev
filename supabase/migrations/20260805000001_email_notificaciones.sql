-- =============================================================
-- Defensoría del Pueblo — Migración 0001 (posterior a 0000)
-- Amplía public.notificaciones para registrar envíos de correo
-- transaccionales de la Edge Function notificar-solicitud.
-- La migración inicial (20260805000000_init.sql) NO se modifica.
-- =============================================================

-- ---------------------------------------------------------------
-- 1. Enum: estado de envío de correo
-- ---------------------------------------------------------------
create type public.envio_estado as enum ('pendiente', 'enviado', 'fallido');

-- ---------------------------------------------------------------
-- 2. Ampliar public.notificaciones
--    - usuario_id pasa a ser opcional: los correos al ciudadano
--      anónimo no tienen perfil interno.
--    - solicitud_id vincula el intento al expediente.
--    - destinatario: correo efectivamente usado.
--    - estado_envio / proveedor_id / mensaje_error / enviado_at:
--      bitácora del proveedor de correo.
--    - idempotency_key: evita envíos duplicados (único parcial).
-- ---------------------------------------------------------------
alter table public.notificaciones
  alter column usuario_id drop not null,
  add column solicitud_id uuid references public.solicitudes (id) on delete set null,
  add column destinatario text,
  add column estado_envio public.envio_estado,
  add column proveedor_id text,
  add column mensaje_error text,
  add column enviado_at timestamptz,
  add column idempotency_key text;

comment on column public.notificaciones.estado_envio is
  'Estado del envío de correo: pendiente, enviado o fallido. NULL para notificaciones internas sin correo.';
comment on column public.notificaciones.idempotency_key is
  'Clave de idempotencia (evento + solicitud_id) para impedir duplicados de correo.';

-- ---------------------------------------------------------------
-- 3. Índices
-- ---------------------------------------------------------------
create index idx_notificaciones_solicitud on public.notificaciones (solicitud_id);
create index idx_notificaciones_estado_envio on public.notificaciones (estado_envio);

create unique index idx_notificaciones_idempotency
on public.notificaciones (idempotency_key)
where idempotency_key is not null;

-- ---------------------------------------------------------------
-- 4. RLS: la Edge Function opera con service_role (omite RLS).
--    Añadir lectura de la bitácora de envíos para administración.
--    Las políticas existentes siguen vigentes:
--      notificaciones_select_own, _insert_staff, _update_own,
--      _delete_own_or_admin.
-- ---------------------------------------------------------------
create policy "notificaciones_select_admin_bitacora"
on public.notificaciones for select
using (public.current_app_role() = 'administrador');
