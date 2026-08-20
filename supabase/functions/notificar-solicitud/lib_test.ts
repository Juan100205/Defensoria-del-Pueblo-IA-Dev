import {
  assertFalse,
  assertTrue,
} from "jsr:@std/assert@1/assert";
import { assertEquals } from "jsr:@std/assert@1/equals";
import {
  autorizado,
  construirIdempotencia,
  construirContenido,
  esCorreoValido,
  esViolacionIdempotencia,
  extraerEventos,
  manejarPeticion,
  type ClienteResend,
  type ClienteSupabase,
  type DatosSolicitud,
  type ResultadoEnvio,
} from "./lib.ts";

type Fila = Record<string, unknown>;

const CONFIG = { appUrl: "https://app.example.com", emailFrom: "noreply@example.com" };

const solicitudConCorreo: Fila = {
  id: "s1",
  radicado: "RAD-2026-001",
  correo: "ciudadano@example.com",
  estado: "Recibida",
  tipo: "Queja",
  urgencia: "Media",
  fecha_radicacion: "2026-08-05",
  updated_at: "2026-08-05T10:00:00Z",
  funcionario_id: null,
  dependencia_id: null,
};

function webhookInsert(): Record<string, unknown> {
  return {
    type: "INSERT",
    table: "solicitudes",
    schema: "public",
    record: { id: "s1", estado: "Recibida", updated_at: "2026-08-05T10:00:00Z", funcionario_id: null },
    old_record: {},
  };
}

function webhookUpdate(
  record: Record<string, unknown>,
  oldRecord: Record<string, unknown>,
): Record<string, unknown> {
  return { type: "UPDATE", table: "solicitudes", schema: "public", record, old_record: oldRecord };
}

function fakeSupabase(opciones: {
  solicitud?: Fila | null;
  perfil?: Fila | null;
  dependencia?: Fila | null;
  insertDuplicado?: boolean;
}): ClienteSupabase {
  const notificaciones: Fila[] = [];

  const consultar = async (
    tabla: string,
    variante: "single" | "maybeSingle",
  ): Promise<{ data: Fila | null; error: unknown }> => {
    if (tabla === "solicitudes") {
      if (opciones.solicitud === undefined) {
        return { data: null, error: null };
      }
      if (opciones.solicitud === null && variante === "single") {
        return { data: null, error: { message: "No rows" } };
      }
      return { data: opciones.solicitud, error: null };
    }
    if (tabla === "profiles") {
      return opciones.perfil ? { data: opciones.perfil, error: null } : { data: null, error: null };
    }
    if (tabla === "dependencias") {
      return opciones.dependencia
        ? { data: opciones.dependencia, error: null }
        : { data: null, error: null };
    }
    return { data: null, error: { message: `tabla desconocida: ${tabla}` } };
  };

  return {
    from: (tabla: string) => ({
      select: () => cadena(tabla),
      insert: (fila: Fila) => ({
        select: () => ({
          single: async () => {
            if (opciones.insertDuplicado) {
              return {
                data: null,
                error: {
                  message: 'duplicate key value violates unique constraint "idx_notificaciones_idempotency" (23505)',
                },
              };
            }
            notificaciones.push(fila);
            return { data: { id: `n${notificaciones.length}` }, error: null };
          },
        }),
      }),
      update: () => ({
        eq: async () => ({ data: null, error: null }),
      }),
    }),
    notificaciones,
  };

  function cadena(tabla: string): unknown {
    return {
      eq: () => cadena(tabla),
      single: () => consultar(tabla, "single"),
      maybeSingle: () => consultar(tabla, "maybeSingle"),
    };
  }
}

function fakeResend(): {
  resend: ClienteResend;
  estado: { cuenta: number; idempotencyKey?: string };
} {
  const estado: { cuenta: number; idempotencyKey?: string } = { cuenta: 0 };
  const resend: ClienteResend = {
    emails: {
      send: async (
        _opciones: {
          from: string;
          to: string[];
          subject: string;
          html: string;
          text: string;
        },
        opcionesIdempotencia?: { idempotencyKey: string },
      ) => {
        estado.cuenta += 1;
        estado.idempotencyKey = opcionesIdempotencia?.idempotencyKey;
        return { data: { id: "resend-1" }, error: null };
      },
    },
  };
  return { resend, estado };
}

function resultadosDe(respuesta: { status: number; cuerpo: unknown }): ResultadoEnvio[] {
  return (respuesta.cuerpo as { resultados: ResultadoEnvio[] }).resultados;
}

Deno.test("secreto incorrecto es rechazado", () => {
  assertFalse(autorizado(null, "secreto"));
  assertFalse(autorizado("", "secreto"));
  assertFalse(autorizado("secreto-erroneo", "secreto"));
  assertFalse(autorizado("secreto", null));
  assertTrue(autorizado("secreto", "secreto"));
});

Deno.test("evento INSERT genera radicado_creado", () => {
  const eventos = extraerEventos(webhookInsert());
  assertEquals(eventos.length, 1);
  assertEquals(eventos[0].solicitudId, "s1");
  assertEquals(eventos[0].evento, "radicado_creado");
  assertEquals(eventos[0].idempotencia, "radicado_creado:s1");
});

Deno.test("payload de otra tabla no genera eventos", () => {
  const cuerpo = {
    type: "INSERT",
    table: "estado_historial",
    schema: "public",
    record: { id: "x" },
    old_record: {},
  };
  assertEquals(extraerEventos(cuerpo), []);
});

Deno.test("UPDATE sin cambio de estado no genera correos", () => {
  const cuerpo = webhookUpdate(
    { id: "s1", estado: "Recibida", updated_at: "2026-08-05T10:00:00Z", funcionario_id: null },
    { id: "s1", estado: "Recibida", updated_at: "2026-08-05T09:00:00Z", funcionario_id: null },
  );
  assertEquals(extraerEventos(cuerpo), []);
});

Deno.test("UPDATE con cambio de estado genera estado_actualizado", () => {
  const cuerpo = webhookUpdate(
    { id: "s1", estado: "En análisis", updated_at: "2026-08-05T10:00:00Z", funcionario_id: null },
    { id: "s1", estado: "Recibida", updated_at: "2026-08-05T09:00:00Z", funcionario_id: null },
  );
  const eventos = extraerEventos(cuerpo);
  assertEquals(eventos.length, 1);
  assertEquals(eventos[0].evento, "estado_actualizado");
  assertEquals(eventos[0].estadoAnterior, "Recibida");
  assertEquals(eventos[0].idempotencia, "estado_actualizado:s1:En análisis:2026-08-05T10:00:00Z");
});

Deno.test("UPDATE a Finalizada genera estado_actualizado y encuesta_satisfaccion", () => {
  const cuerpo = webhookUpdate(
    { id: "s1", estado: "Finalizada", updated_at: "2026-08-05T10:00:00Z", funcionario_id: null },
    { id: "s1", estado: "En trámite", updated_at: "2026-08-05T09:00:00Z", funcionario_id: null },
  );
  const eventos = extraerEventos(cuerpo);
  assertEquals(eventos.map((e) => e.evento), ["estado_actualizado", "encuesta_satisfaccion"]);
});

Deno.test("asignación de funcionario genera solicitud_asignada", () => {
  const cuerpo = webhookUpdate(
    { id: "s1", estado: "Asignada", updated_at: "2026-08-05T10:00:00Z", funcionario_id: "u1" },
    { id: "s1", estado: "Recibida", updated_at: "2026-08-05T09:00:00Z", funcionario_id: null },
  );
  const eventos = extraerEventos(cuerpo);
  const asignada = eventos.find((e) => e.evento === "solicitud_asignada");
  assertEquals(asignada?.idempotencia, "solicitud_asignada:s1:u1:2026-08-05T10:00:00Z");
});

Deno.test("webhook repetido produce la misma clave de idempotencia", () => {
  const cuerpo = webhookUpdate(
    { id: "s1", estado: "En análisis", updated_at: "2026-08-05T10:00:00Z", funcionario_id: null },
    { id: "s1", estado: "Recibida", updated_at: "2026-08-05T09:00:00Z", funcionario_id: null },
  );
  const a = extraerEventos(cuerpo)[0];
  const b = extraerEventos(cuerpo)[0];
  assertEquals(a.idempotencia, b.idempotencia);
});

Deno.test("webhook repetido no reenvía el correo (idempotencia en BD)", async () => {
  const cuerpo = webhookUpdate(
    { id: "s1", estado: "En análisis", updated_at: "2026-08-05T10:00:00Z", funcionario_id: null },
    { id: "s1", estado: "Recibida", updated_at: "2026-08-05T09:00:00Z", funcionario_id: null },
  );

  const supabase1 = fakeSupabase({ solicitud: solicitudConCorreo });
  const envio1 = fakeResend();
  const respuesta1 = await manejarPeticion(
    supabase1 as unknown as ClienteSupabase,
    envio1.resend,
    cuerpo,
    CONFIG,
  );
  assertEquals(respuesta1.status, 200);
  assertEquals(resultadosDe(respuesta1)[0].estado, "enviado");
  assertEquals(envio1.estado.cuenta, 1);
  assertEquals(envio1.estado.idempotencyKey, "estado_actualizado:s1:En análisis:2026-08-05T10:00:00Z");

  const supabase2 = fakeSupabase({ solicitud: solicitudConCorreo, insertDuplicado: true });
  const envio2 = fakeResend();
  const respuesta2 = await manejarPeticion(
    supabase2 as unknown as ClienteSupabase,
    envio2.resend,
    cuerpo,
    CONFIG,
  );
  assertEquals(resultadosDe(respuesta2)[0].estado, "duplicado");
  assertEquals(envio2.estado.cuenta, 0);
});

Deno.test("solicitud inexistente -> fallido sin enviar", async () => {
  const supabase = fakeSupabase({ solicitud: null });
  const envio = fakeResend();
  const respuesta = await manejarPeticion(
    supabase as unknown as ClienteSupabase,
    envio.resend,
    { solicitud_id: "no-existe", evento: "radicado_creado" },
    CONFIG,
  );
  assertEquals(respuesta.status, 500);
  const resultado = resultadosDe(respuesta)[0];
  assertEquals(resultado.estado, "fallido");
  assertEquals(resultado.error, "Solicitud no encontrada");
  assertEquals(envio.estado.cuenta, 0);
});

Deno.test("correo faltante -> fallido sin enviar", async () => {
  const supabase = fakeSupabase({ solicitud: { ...solicitudConCorreo, correo: null } });
  const envio = fakeResend();
  const respuesta = await manejarPeticion(
    supabase as unknown as ClienteSupabase,
    envio.resend,
    { solicitud_id: "s1", evento: "radicado_creado" },
    CONFIG,
  );
  assertEquals(respuesta.status, 500);
  const resultado = resultadosDe(respuesta)[0];
  assertEquals(resultado.estado, "fallido");
  assertEquals(resultado.error, "No hay correo de destinatario válido");
  assertEquals(envio.estado.cuenta, 0);
});

Deno.test("validación de correo", () => {
  assertTrue(esCorreoValido("ciudadano@example.com"));
  assertTrue(esCorreoValido("a.b+tag@dominio.co"));
  assertFalse(esCorreoValido(""));
  assertFalse(esCorreoValido("sin-arroba"));
  assertFalse(esCorreoValido("a@b"));
});

Deno.test("detección de violación de idempotencia (23505)", () => {
  assertTrue(
    esViolacionIdempotencia({
      message: 'duplicate key value violates unique constraint "idx_notificaciones_idempotency" (23505)',
    }),
  );
  assertTrue(esViolacionIdempotencia(new Error("duplicate key value")));
  assertFalse(esViolacionIdempotencia({ message: "otro error" }));
});

Deno.test("construirIdempotencia para llamadas directas", () => {
  const datos: DatosSolicitud = {
    id: "s1",
    radicado: "RAD-2026-001",
    correo: "a@b.co",
    estado: "En análisis",
    tipo: "Queja",
    urgencia: "Media",
    fecha_radicacion: "2026-08-05",
    updated_at: "2026-08-05T10:00:00Z",
    funcionario_id: "u1",
    funcionario_email: null,
    dependencia: null,
  };
  assertEquals(construirIdempotencia("radicado_creado", datos), "radicado_creado:s1");
  assertEquals(
    construirIdempotencia("estado_actualizado", datos),
    "estado_actualizado:s1:En análisis:2026-08-05T10:00:00Z",
  );
  assertEquals(
    construirIdempotencia("solicitud_asignada", datos),
    "solicitud_asignada:s1:u1:2026-08-05T10:00:00Z",
  );
  assertEquals(construirIdempotencia("encuesta_satisfaccion", datos), "encuesta_satisfaccion:s1");
});

Deno.test("las plantillas no exponen datos sensibles", () => {
  const datos: DatosSolicitud = {
    id: "s1",
    radicado: "RAD-2026-001",
    correo: "a@b.co",
    estado: "Recibida",
    tipo: "Denuncia DDHH",
    urgencia: "Alta",
    fecha_radicacion: "2026-08-05",
    updated_at: "2026-08-05T10:00:00Z",
    funcionario_id: null,
    funcionario_email: null,
    dependencia: "Delegada para la Salud",
  };
  const contenido = construirContenido("radicado_creado", datos, "https://app.example.com", null);
  assertTrue(contenido.text.includes("RAD-2026-001"));
  assertFalse(contenido.html.includes("1234567890"));
  assertFalse(contenido.text.includes("teléfono"));
  assertFalse(contenido.text.toLowerCase().includes("descripcion"));
});
