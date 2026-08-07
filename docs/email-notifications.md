# Correos transaccionales

Envío de notificaciones por correo electrónico desde una Edge Function de Supabase usando Resend.

## Arquitectura

```
Database Webhook (INSERT/UPDATE en public.solicitudes)
        |
        v
Edge Function: notificar-solicitud
        |                       \
        | 1. Valida x-webhook-secret |
        | 2. Lee datos en Supabase   |
        | 3. Reclama idempotencia    |
        | 4. Envía vía Resend        |
        v                           v
public.notificaciones (bitácora)   Email al destinatario
```

- La función recibe únicamente el `record` del webhook (con `solicitud_id` en
  `record.id`) y el evento derivado. No acepta destinatario, asunto ni HTML
  provenientes del cliente.
- Se ejecuta con `service_role` (omite RLS) usando las variables que Supabase
  inyecta automáticamente: `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- Está protegida por un secreto compartido enviado en el encabezado
  `x-webhook-secret`. La función se despliega sin verificación JWT
  (`verify_jwt = false`), por lo que ese encabezado es la única barrera.
- Los correos se registran en `public.notificaciones` con estado `pendiente`,
  `enviado` o `fallido`, más el id del mensaje del proveedor (`proveedor_id`).

## Formato real del Database Webhook

Supabase envía el payload con esta estructura:

```json
{
  "type": "INSERT",
  "table": "solicitudes",
  "schema": "public",
  "record": { "id": "...", "estado": "Recibida", "updated_at": "2026-08-05T10:00:00Z" },
  "old_record": {}
}
```

- `type`: `INSERT` o `UPDATE`.
- `table`: siempre `solicitudes`.
- `record`: fila nueva.
- `old_record`: fila anterior (vacío en INSERT).

La función obtiene el `solicitud_id` desde `record.id`.

## Eventos soportados

| Evento                  | Cuándo                                                  | Destinatario                       |
| ----------------------- | ------------------------------------------------------- | ---------------------------------- |
| `radicado_creado`       | `type = INSERT`                                         | Ciudadano (`solicitudes.correo`)   |
| `estado_actualizado`    | `old_record.estado != record.estado`                    | Ciudadano (`solicitudes.correo`)   |
| `solicitud_asignada`    | cambia `funcionario_id` (o `analista_id`)               | Analista (`profiles.email`)        |
| `encuesta_satisfaccion` | `record.estado = 'Finalizada'`                          | Ciudadano (`solicitudes.correo`)   |

No se envían correos por actualizaciones de otras columnas.

La encuesta de satisfacción solo se envía cuando la solicitud queda cerrada.

## Seguridad

- `supabase/config.toml`:

  ```toml
  [functions.notificar-solicitud]
  verify_jwt = false
  ```

- La función valida el encabezado `x-webhook-secret: <WEBHOOK_SECRET>`. Si el
  valor no coincide con el secreto configurado, responde `401` sin procesar nada.
- Sin `WEBHOOK_SECRET` configurado, la función rechaza toda petición.
- No se aceptan destinatarios arbitrarios: el destino se resuelve en el servidor
  desde la solicitud y el perfil del funcionario.

## Protección de datos

La función **nunca** incluye en el correo: descripción del caso, número de
documento, teléfono, información de salud ni enlaces a archivos adjuntos.
Solo se usa: radicado, fecha de radicación, estado, tipo, tema y prioridad.

## Anti-duplicados (idempotencia)

Cada intento inserta una fila en `public.notificaciones` con una clave de
idempotencia en `idempotency_key` (índice único parcial). Si el webhook
reintenta, el INSERT falla por unicidad y la función responde
`{ "estado": "duplicado" }` sin reenviar.

Claves según evento:

| Evento                  | Clave                                                          |
| ----------------------- | -------------------------------------------------------------- |
| `radicado_creado`       | `radicado_creado:<solicitud_id>`                               |
| `estado_actualizado`    | `estado_actualizado:<solicitud_id>:<estado_nuevo>:<updated_at>`|
| `solicitud_asignada`    | `solicitud_asignada:<solicitud_id>:<funcionario_id>:<updated_at>` |
| `encuesta_satisfaccion` | `encuesta_satisfaccion:<solicitud_id>`                         |

La misma clave se envía a Resend como `Idempotency-Key` (segundo argumento de
`emails.send(..., { idempotencyKey })`), de modo que un reintento no duplique el
correo ni a nivel de Resend ni a nivel de base de datos.

## Base de datos

Migración: `supabase/migrations/20260805000001_email_notificaciones.sql`

- Enum `public.envio_estado` (`pendiente`, `enviado`, `fallido`).
- `public.notificaciones` ampliada: `solicitud_id`, `destinatario`,
  `estado_envio`, `proveedor_id`, `mensaje_error`, `enviado_at`, `idempotency_key`.
- `usuario_id` pasa a ser opcional (los correos al ciudadano no tienen perfil interno).
- Política RLS adicional: los administradores leen toda la bitácora de envíos.

## Variables de entorno

Las Edge Functions de Supabase inyectan `SUPABASE_URL` y
`SUPABASE_SERVICE_ROLE_KEY` automáticamente al desplegarse; no es necesario
definirlas. Secretos a configurar (`supabase secrets set`):

| Variable        | Descripción                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `RESEND_API_KEY`| API key de Resend                                                        |
| `EMAIL_FROM`    | Remitente verificado en Resend, ej. `No-Reply Defensoría <noreply@dominio>` |
| `APP_URL`       | URL pública de la app (enlaces en los correos)                           |
| `WEBHOOK_SECRET`| Secreto compartido para el encabezado `x-webhook-secret`                 |

Archivos de ejemplo (solo nombres, sin valores):

- `.env.example` (raíz): únicamente variables del frontend
  (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
- `supabase/functions/.env.example`: secretos para desarrollo local de
  funciones (incluye `SUPABASE_SERVICE_ROLE_KEY`, que nunca va en el frontend).

`.env`, `.env.local`, `.env.*.local` y `supabase/functions/**/.env*` están en
`.gitignore`; los `.env.example` sí se versionan.

## Configuración en Supabase

1. Aplicar la migración 0001.
2. Desplegar la función (con `verify_jwt = false` según `supabase/config.toml`):

   ```bash
   supabase functions deploy notificar-solicitud
   ```

3. Definir los secretos de la función (`RESEND_API_KEY`, `EMAIL_FROM`,
   `APP_URL`, `WEBHOOK_SECRET`).
4. En el dashboard (Database → Webhooks) crear dos webhooks hacia la URL de la
   función, enviando el encabezado `x-webhook-secret: <WEBHOOK_SECRET>`:
   - **INSERT** en `public.solicitudes`.
   - **UPDATE** en `public.solicitudes` (con `old_record` para detectar cambios
     reales de estado y de asignación).
5. Configurar el dominio remitente en Resend y verificar `EMAIL_FROM`.

## Pruebas

La lógica pura está en `lib.ts`; las pruebas unitarias están en
`lib_test.ts`. Para ejecutarlas:

```bash
deno test supabase/functions/notificar-solicitud/lib_test.ts
```

Escenarios cubiertos: secreto incorrecto, evento INSERT, UPDATE sin cambio de
estado, UPDATE con cambio de estado, webhook repetido (misma clave de
idempotencia y no reenvío), solicitud inexistente, correo faltante, validación
de correo, violación de unicidad (23505) y plantillas sin datos sensibles.

Llamada manual (reemplazando `<url>`, `<secreto>`, `<solicitud_id>` y `<evento>`):

```bash
curl -X POST "<url>/functions/v1/notificar-solicitud" \
  -H "x-webhook-secret: <secreto>" \
  -H "Content-Type: application/json" \
  -d '{"solicitud_id": "<solicitud_id>", "evento": "radicado_creado"}'
```

Respuesta esperada:

```json
{ "resultados": [{ "solicitud_id": "...", "evento": "radicado_creado", "estado": "enviado" }] }
```

Verificar la bitácora:

```sql
select solicitud_id, tipo, destinatario, estado_envio, proveedor_id, enviado_at
from public.notificaciones
order by created_at desc;
```
