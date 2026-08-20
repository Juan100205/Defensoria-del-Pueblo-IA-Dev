export const EVENTOS_PERMITIDOS = [
  "radicado_creado",
  "estado_actualizado",
  "solicitud_asignada",
  "encuesta_satisfaccion",
] as const;

export type Evento = (typeof EVENTOS_PERMITIDOS)[number];

export interface EventoProcesar {
  solicitudId: string;
  evento: Evento;
  estadoAnterior?: string | null;
  idempotencia?: string;
}

export interface ClienteSupabase {
  from: (tabla: string) => any;
}

export interface ClienteResend {
  emails: {
    send: (
      opciones: {
        from: string;
        to: string[];
        subject: string;
        html: string;
        text: string;
      },
      opcionesIdempotencia?: { idempotencyKey: string },
    ) => Promise<{ data: { id: string } | null; error: unknown }>;
  };
}

export interface ConfigFuncion {
  appUrl: string | null;
  emailFrom: string;
}

export interface DatosSolicitud {
  id: string;
  radicado: string;
  correo: string | null;
  estado: string;
  tipo: string;
  urgencia: string;
  fecha_radicacion: string;
  updated_at: string | null;
  funcionario_id: string | null;
  funcionario_email: string | null;
  dependencia: string | null;
}

export interface ResultadoEnvio {
  solicitud_id: string;
  evento: Evento;
  estado: "enviado" | "fallido" | "duplicado";
  destinatario?: string;
  proveedor_id?: string | null;
  error?: string;
  idempotencia?: string;
}

export function autorizado(xWebhookSecret: string | null, webhookSecret: string | null): boolean {
  if (!webhookSecret) {
    return false;
  }
  return xWebhookSecret === webhookSecret;
}

export function extraerEventos(cuerpo: Record<string, unknown>): EventoProcesar[] {
  if (typeof cuerpo.solicitud_id === "string" && typeof cuerpo.evento === "string") {
    if (!esEventoPermitido(cuerpo.evento)) {
      return [];
    }
    return [
      {
        solicitudId: cuerpo.solicitud_id,
        evento: cuerpo.evento,
        estadoAnterior:
          typeof cuerpo.estado_anterior === "string" ? cuerpo.estado_anterior : null,
      },
    ];
  }

  if (cuerpo.table !== "solicitudes" || !esPayloadWebhook(cuerpo)) {
    return [];
  }

  const record = cuerpo.record as Record<string, unknown>;
  const oldRecord = (cuerpo.old_record ?? {}) as Record<string, unknown>;
  const solicitudId = typeof record.id === "string" ? record.id : "";
  if (!solicitudId) {
    return [];
  }

  const updatedAt = typeof record.updated_at === "string" ? record.updated_at : "";

  if (cuerpo.type === "INSERT") {
    return [
      {
        solicitudId,
        evento: "radicado_creado",
        idempotencia: `radicado_creado:${solicitudId}`,
      },
    ];
  }

  if (cuerpo.type !== "UPDATE") {
    return [];
  }

  const eventos: EventoProcesar[] = [];

  const estadoNuevo = record.estado;
  const estadoAnterior = oldRecord.estado;
  if (
    typeof estadoNuevo === "string" &&
    typeof estadoAnterior === "string" &&
    estadoNuevo !== estadoAnterior
  ) {
    eventos.push({
      solicitudId,
      evento: "estado_actualizado",
      estadoAnterior,
      idempotencia: `estado_actualizado:${solicitudId}:${estadoNuevo}:${updatedAt}`,
    });
    if (estadoNuevo === "Finalizada") {
      eventos.push({
        solicitudId,
        evento: "encuesta_satisfaccion",
        idempotencia: `encuesta_satisfaccion:${solicitudId}`,
      });
    }
  }

  const cambioFuncionario = valorId(record.funcionario_id) !== valorId(oldRecord.funcionario_id);
  const cambioAnalista = valorId(record.analista_id) !== valorId(oldRecord.analista_id);
  if (cambioFuncionario || cambioAnalista) {
    const responsable = typeof record.funcionario_id === "string"
      ? record.funcionario_id
      : typeof record.analista_id === "string"
      ? record.analista_id
      : "";
    eventos.push({
      solicitudId,
      evento: "solicitud_asignada",
      idempotencia: `solicitud_asignada:${solicitudId}:${responsable}:${updatedAt}`,
    });
  }

  const unicos = new Map<string, EventoProcesar>();
  for (const evento of eventos) {
    unicos.set(`${evento.evento}:${evento.idempotencia ?? ""}`, evento);
  }
  return [...unicos.values()];
}

export function construirIdempotencia(evento: Evento, datos: DatosSolicitud): string {
  switch (evento) {
    case "radicado_creado":
      return `radicado_creado:${datos.id}`;
    case "estado_actualizado":
      return `estado_actualizado:${datos.id}:${datos.estado}:${datos.updated_at ?? ""}`;
    case "solicitud_asignada":
      return `solicitud_asignada:${datos.id}:${datos.funcionario_id ?? ""}:${datos.updated_at ?? ""}`;
    case "encuesta_satisfaccion":
      return `encuesta_satisfaccion:${datos.id}`;
  }
}

export async function manejarPeticion(
  supabase: ClienteSupabase,
  resend: ClienteResend,
  cuerpo: Record<string, unknown>,
  config: ConfigFuncion,
): Promise<{ status: number; cuerpo: unknown }> {
  const peticiones = extraerEventos(cuerpo);
  if (peticiones.length === 0) {
    return { status: 400, cuerpo: { error: "Solicitud o evento no permitido" } };
  }

  const resultados: ResultadoEnvio[] = [];
  let algunoFallido = false;

  for (const peticion of peticiones) {
    try {
      const resultado = await procesarEvento(supabase, resend, peticion, config);
      resultados.push(resultado);
      if (resultado.estado === "fallido") {
        algunoFallido = true;
      }
    } catch (error) {
      algunoFallido = true;
      resultados.push({
        solicitud_id: peticion.solicitudId,
        evento: peticion.evento,
        estado: "fallido",
        error: mensajeError(error),
      });
    }
  }

  return { status: algunoFallido ? 500 : 200, cuerpo: { resultados } };
}

async function procesarEvento(
  supabase: ClienteSupabase,
  resend: ClienteResend,
  peticion: EventoProcesar,
  config: ConfigFuncion,
): Promise<ResultadoEnvio> {
  const datos = await cargarSolicitud(supabase, peticion.solicitudId);
  if (datos === null) {
    return {
      solicitud_id: peticion.solicitudId,
      evento: peticion.evento,
      estado: "fallido",
      error: "Solicitud no encontrada",
    };
  }

  const idempotencia = peticion.idempotencia ?? construirIdempotencia(peticion.evento, datos);

  const reclamado = await reclamarEnvio(supabase, peticion.solicitudId, peticion.evento, idempotencia);
  if (reclamado.tipo === "duplicado") {
    return { solicitud_id: peticion.solicitudId, evento: peticion.evento, estado: "duplicado", idempotencia };
  }
  if (reclamado.tipo === "error") {
    return {
      solicitud_id: peticion.solicitudId,
      evento: peticion.evento,
      estado: "fallido",
      error: reclamado.error,
      idempotencia,
    };
  }
  const filaId = reclamado.filaId;

  const destinatario = resolverDestinatario(peticion.evento, datos);
  if (!destinatario) {
    await marcarFallo(supabase, filaId, "No hay correo de destinatario válido");
    return {
      solicitud_id: peticion.solicitudId,
      evento: peticion.evento,
      estado: "fallido",
      error: "No hay correo de destinatario válido",
      idempotencia,
    };
  }

  const contenido = construirContenido(
    peticion.evento,
    datos,
    config.appUrl,
    peticion.estadoAnterior ?? null,
  );

  try {
    const { data, error } = await resend.emails.send(
      {
        from: config.emailFrom,
        to: [destinatario],
        subject: contenido.subject,
        html: contenido.html,
        text: contenido.text,
      },
      { idempotencyKey: idempotencia },
    );

    if (error) {
      throw new Error(mensajeError(error));
    }

    await supabase
      .from("notificaciones")
      .update({
        destinatario,
        estado_envio: "enviado",
        proveedor_id: data?.id ?? null,
        enviado_at: new Date().toISOString(),
      })
      .eq("id", filaId);

    return {
      solicitud_id: peticion.solicitudId,
      evento: peticion.evento,
      estado: "enviado",
      destinatario,
      proveedor_id: data?.id ?? null,
      idempotencia,
    };
  } catch (error) {
    const mensaje = mensajeError(error);
    await marcarFallo(supabase, filaId, mensaje, destinatario);
    return {
      solicitud_id: peticion.solicitudId,
      evento: peticion.evento,
      estado: "fallido",
      error: mensaje,
      idempotencia,
    };
  }
}

type ResultadoReclamo =
  | { tipo: "ok"; filaId: string }
  | { tipo: "duplicado" }
  | { tipo: "error"; error: string };

async function reclamarEnvio(
  supabase: ClienteSupabase,
  solicitudId: string,
  evento: Evento,
  idempotencia: string,
): Promise<ResultadoReclamo> {
  const { data, error } = await supabase
    .from("notificaciones")
    .insert({
      solicitud_id: solicitudId,
      tipo: evento,
      titulo: `Correo: ${evento}`,
      estado_envio: "pendiente",
      idempotency_key: idempotencia,
    })
    .select("id")
    .single();

  if (data) {
    return { tipo: "ok", filaId: data.id };
  }

  if (error && esViolacionIdempotencia(error)) {
    return { tipo: "duplicado" };
  }

  return { tipo: "error", error: mensajeError(error) };
}

export async function cargarSolicitud(
  supabase: ClienteSupabase,
  solicitudId: string,
): Promise<DatosSolicitud | null> {
  const { data: solicitud, error } = await supabase
    .from("solicitudes")
    .select(
      "id, radicado, correo, estado, tipo, urgencia, fecha_radicacion, updated_at, funcionario_id, dependencia_id",
    )
    .eq("id", solicitudId)
    .single();

  if (error || !solicitud) {
    return null;
  }

  let funcionarioEmail: string | null = null;
  if (solicitud.funcionario_id) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", solicitud.funcionario_id)
      .maybeSingle();
    funcionarioEmail = perfil?.email ?? null;
  }

  let dependencia: string | null = null;
  if (solicitud.dependencia_id) {
    const { data: dependenciaRow } = await supabase
      .from("dependencias")
      .select("nombre")
      .eq("id", solicitud.dependencia_id)
      .maybeSingle();
    dependencia = dependenciaRow?.nombre ?? null;
  }

  return {
    id: solicitud.id,
    radicado: solicitud.radicado,
    correo: solicitud.correo,
    estado: solicitud.estado,
    tipo: solicitud.tipo,
    urgencia: solicitud.urgencia,
    fecha_radicacion: solicitud.fecha_radicacion,
    updated_at: solicitud.updated_at ?? null,
    funcionario_id: solicitud.funcionario_id ?? null,
    funcionario_email: funcionarioEmail,
    dependencia,
  };
}

function resolverDestinatario(evento: Evento, datos: DatosSolicitud): string | null {
  const correo = evento === "solicitud_asignada" ? datos.funcionario_email : datos.correo;
  if (!correo || !esCorreoValido(correo)) {
    return null;
  }
  return correo;
}

function esEventoPermitido(valor: string): valor is Evento {
  return (EVENTOS_PERMITIDOS as readonly string[]).includes(valor);
}

function esPayloadWebhook(cuerpo: Record<string, unknown>): boolean {
  return (
    typeof cuerpo.type === "string" &&
    typeof cuerpo.record === "object" &&
    cuerpo.record !== null
  );
}

function valorId(valor: unknown): string {
  return typeof valor === "string" ? valor : "";
}

export function esCorreoValido(correo: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

export function esViolacionIdempotencia(error: unknown): boolean {
  const mensaje = mensajeError(error).toLowerCase();
  return (
    mensaje.includes("duplicate key") ||
    mensaje.includes("23505") ||
    mensaje.includes("unique constraint")
  );
}

export function construirContenido(
  evento: Evento,
  datos: DatosSolicitud,
  appUrl: string | null,
  estadoAnterior: string | null,
): { subject: string; html: string; text: string } {
  switch (evento) {
    case "radicado_creado":
      return radicadoCreado(datos, appUrl);
    case "estado_actualizado":
      return estadoActualizado(datos, estadoAnterior);
    case "solicitud_asignada":
      return solicitudAsignada(datos, appUrl);
    case "encuesta_satisfaccion":
      return encuestaSatisfaccion(datos, appUrl);
  }
}

function plantillaBase(
  titulo: string,
  contenidoHtml: string,
  contenidoTexto: string,
): { html: string; text: string } {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escHtml(titulo)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
      <tr>
        <td style="padding:24px 24px 8px 24px;">
          <h1 style="font-size:18px;margin:0 0 16px 0;color:#111827;">${escHtml(titulo)}</h1>
          ${contenidoHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px 24px 24px;">
          <p style="font-size:12px;line-height:1.5;color:#6b7280;margin:0;border-top:1px solid #e5e7eb;padding-top:16px;">
            Defensoría del Pueblo &middot; Este es un mensaje automático. No responda a este correo.
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
  return { html, text: contenidoTexto };
}

function radicadoCreado(
  datos: DatosSolicitud,
  appUrl: string | null,
): { subject: string; html: string; text: string } {
  const subject = `Su solicitud fue radicada — N.º ${datos.radicado}`;
  const link = appUrl ? `${appUrl}/consulta` : "";
  const html = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">Cordial saludo,</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">
      Hemos recibido su solicitud y quedó radicada con el número
      <strong>${escHtml(datos.radicado)}</strong> el ${escHtml(datos.fecha_radicacion)}.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">
      Su solicitud inicia en estado <strong>Recibida</strong> y será gestionada por la
      dependencia correspondiente.
    </p>
    ${
      link
        ? `<p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">
            Para consultar el avance de su trámite ingrese a nuestra página de consulta:
            <a href="${escAttr(link)}" style="color:#155eef;">${escHtml(link)}</a>. Necesitará su número de
            radicado y el número de su documento de identidad.
          </p>`
        : ""
    }`;
  const text = `Cordial saludo,

Hemos recibido su solicitud y quedó radicada con el número ${datos.radicado} el ${datos.fecha_radicacion}.

Su solicitud inicia en estado "Recibida" y será gestionada por la dependencia correspondiente.
${
  link
    ? `Para consultar el avance de su trámite ingrese a: ${link}. Necesitará su número de radicado y el número de su documento de identidad.`
    : ""
}`;
  return { subject, ...plantillaBase(subject, html, text) };
}

function estadoActualizado(
  datos: DatosSolicitud,
  estadoAnterior: string | null,
): { subject: string; html: string; text: string } {
  const subject = `Actualización de su solicitud — N.º ${datos.radicado}`;
  const html = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">Cordial saludo,</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">
      Le informamos que el estado de su solicitud <strong>${escHtml(datos.radicado)}</strong>
      cambió a <strong>${escHtml(datos.estado)}</strong>${
        estadoAnterior ? ` (anterior: ${escHtml(estadoAnterior)})` : ""
      }.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0;">Fecha de actualización: ${new Date().toLocaleDateString("es-CO")}.</p>`;
  const text = `Cordial saludo,

Le informamos que el estado de su solicitud ${datos.radicado} cambió a "${datos.estado}"${
    estadoAnterior ? ` (anterior: ${estadoAnterior})` : ""
  }.

Fecha de actualización: ${new Date().toLocaleDateString("es-CO")}.`;
  return { subject, ...plantillaBase(subject, html, text) };
}

function solicitudAsignada(
  datos: DatosSolicitud,
  appUrl: string | null,
): { subject: string; html: string; text: string } {
  const subject = `Solicitud asignada para su gestión — N.º ${datos.radicado}`;
  const interno = appUrl ?? "";
  const html = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">Cordial saludo,</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">
      Se le ha asignado la solicitud <strong>${escHtml(datos.radicado)}</strong>
      (${escHtml(datos.tipo)}${datos.dependencia ? ` &middot; ${escHtml(datos.dependencia)}` : ""}).
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">
      Prioridad: <strong>${escHtml(datos.urgencia)}</strong>.
    </p>
    ${
      interno
        ? `<p style="font-size:15px;line-height:1.6;margin:0;">
            Ingrese al tablero interno para gestionarla: <a href="${escAttr(interno)}" style="color:#155eef;">${escHtml(interno)}</a>.
          </p>`
        : ""
    }`;
  const text = `Cordial saludo,

Se le ha asignado la solicitud ${datos.radicado} (${datos.tipo}${datos.dependencia ? ` · ${datos.dependencia}` : ""}).

Prioridad: ${datos.urgencia}.
${interno ? `Ingrese al tablero interno para gestionarla: ${interno}.` : ""}`;
  return { subject, ...plantillaBase(subject, html, text) };
}

function encuestaSatisfaccion(
  datos: DatosSolicitud,
  appUrl: string | null,
): { subject: string; html: string; text: string } {
  const subject = `Cuéntenos sobre su experiencia — N.º ${datos.radicado}`;
  const enlaceEncuesta = appUrl
    ? `${appUrl}/encuesta?radicado=${encodeURIComponent(datos.radicado)}`
    : "";
  const html = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">Cordial saludo,</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px 0;">
      Su solicitud <strong>${escHtml(datos.radicado)}</strong> fue finalizada. Su opinión nos ayuda a mejorar.
    </p>
    ${
      enlaceEncuesta
        ? `<p style="font-size:15px;line-height:1.6;margin:0;">
            Responda la encuesta de satisfacción: <a href="${escAttr(enlaceEncuesta)}" style="color:#155eef;">${escHtml(enlaceEncuesta)}</a>.
          </p>`
        : ""
    }`;
  const text = `Cordial saludo,

Su solicitud ${datos.radicado} fue finalizada. Su opinión nos ayuda a mejorar.
${enlaceEncuesta ? `Responda la encuesta de satisfacción: ${enlaceEncuesta}.` : ""}`;
  return { subject, ...plantillaBase(subject, html, text) };
}

async function marcarFallo(
  supabase: ClienteSupabase,
  filaId: string,
  mensaje: string,
  destinatario: string | null = null,
): Promise<void> {
  await supabase
    .from("notificaciones")
    .update({
      destinatario,
      estado_envio: "fallido",
      mensaje_error: mensaje.slice(0, 2000),
      enviado_at: new Date().toISOString(),
    })
    .eq("id", filaId);
}

export function escHtml(valor: string): string {
  return valor.replace(/[&<>"']/g, (c) => {
    const entidades: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entidades[c];
  });
}

function escAttr(valor: string): string {
  return escHtml(valor);
}

export function mensajeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}
