import { createClient } from "jsr:@supabase/supabase-js@2";
import { Resend } from "npm:resend@^4.0.0";
import {
  autorizado,
  manejarPeticion,
  mensajeError,
  type ClienteResend,
  type ClienteSupabase,
} from "./lib.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM");
const APP_URL = Deno.env.get("APP_URL");
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");

Deno.serve(async (req: Request): Promise<Response> => {
  if (!autorizado(req.headers.get("x-webhook-secret"), WEBHOOK_SECRET)) {
    return json({ error: "No autorizado" }, 401);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY || !EMAIL_FROM) {
    return json({ error: "Configuración incompleta del servidor" }, 500);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  }) as unknown as ClienteSupabase;

  const resend = new Resend(RESEND_API_KEY) as unknown as ClienteResend;

  try {
    const cuerpo = (await req.json()) as Record<string, unknown>;
    const respuesta = await manejarPeticion(supabase, resend, cuerpo, {
      appUrl: APP_URL,
      emailFrom: EMAIL_FROM,
    });
    return json(respuesta.cuerpo, respuesta.status);
  } catch (error) {
    return json({ error: mensajeError(error) }, 500);
  }
});

function json(objeto: unknown, status: number): Response {
  return new Response(JSON.stringify(objeto), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
