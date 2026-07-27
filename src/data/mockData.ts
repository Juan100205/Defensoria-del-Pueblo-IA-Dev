import type { SolicitudRecord } from './constants';
import {
  DEPTOS, MUNIS, TIPOS, ESTADOS, TEMAS, ASUNTOS, NOMBRES, FUNCIONARIOS,
} from './constants';

let SEED = 42;
function sr(): number {
  SEED = (SEED * 1103515245 + 12345) & 0x7fffffff;
  return SEED / 0x7fffffff;
}

function pick<T>(a: readonly T[]): T {
  return a[Math.floor(sr() * a.length)];
}

function pint(a: number, b: number): number {
  return Math.floor(sr() * (b - a + 1)) + a;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function makeRecords(n: number): SolicitudRecord[] {
  const out: SolicitudRecord[] = [];
  const now = new Date('2026-07-22T16:40:00');
  for (let i = 0; i < n; i++) {
    const dep = pick(DEPTOS);
    const tema = pick(TEMAS);
    const tipo = pick(TIPOS);
    const est = pick(ESTADOS);
    const urg = est === 'Finalizada' ? pick(['Baja', 'Media']) : pick(['Alta', 'Media', 'Media', 'Baja']);
    const d = new Date(now.getTime() - pint(0, 29) * 864e5 - pint(0, 20) * 36e5);
    out.push({
      rad: 'DP-2026-0' + (14200 + i * 7),
      nombre: pick(NOMBRES),
      doc: 'CC ' + pint(10, 99) + '.' + pint(100, 999) + '.' + pint(100, 999),
      correo: '',
      tel: '3' + pint(10, 29) + ' ' + pint(100, 999) + ' ' + pint(1000, 9999),
      tipo,
      tema,
      dep,
      muni: pick(MUNIS[dep]),
      asunto: pick(ASUNTOS[tema]),
      estado: est,
      urg,
      fecha: `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`,
      hora: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
      resp: pick(FUNCIONARIOS).n,
      dias: pint(1, 15),
    });
  }
  return out;
}

export const RECORDS = makeRecords(48);

export const SAMPLE = {
  nombre: 'Luisa Fernanda Ospina Cárdenas',
  documento: 'CC 1.032.487.115',
  correo: 'luisa.ospina@correo.com',
  telefono: '318 445 0912',
  ciudad: 'Medellín, Antioquia',
  tipo: 'Queja',
  descripcion:
    'El 3 de junio pedí a mi EPS la autorización de la cirugía que ordenó el especialista para mi mamá, que tiene 68 años. Han pasado más de 40 días, he ido tres veces a la sede y solo me dicen que el trámite sigue en estudio. Ella tiene dolor permanente y ya no puede trabajar. Necesito que la Defensoría intervenga.',
  archivos: '2 archivos adjuntos',
  consentimiento: 'Autorizo el tratamiento de mis datos',
};

export interface ChatStep {
  k: string;
  t: string;
  bot: string[];
  ui: 'text' | 'doc' | 'city' | 'type' | 'area' | 'files' | 'consent';
  ph?: string;
}

export const STEPS: ChatStep[] = [
  {
    k: 'nombre',
    t: 'Identificación',
    bot: [
      'Buenas tardes. Soy el asistente de radicación de la Defensoría del Pueblo.',
      'Le voy a hacer unas preguntas cortas, una a la vez, y al final le entrego su número de radicado.<span class="hint">Empecemos: ¿cuál es su nombre completo?</span>',
    ],
    ui: 'text',
    ph: 'Nombre y apellidos',
  },
  {
    k: 'documento',
    t: 'Documento',
    bot: ['Gracias, <b>{first}</b>. ¿Cuál es su documento de identidad?'],
    ui: 'doc',
  },
  {
    k: 'correo',
    t: 'Contacto',
    bot: ['¿A qué correo electrónico le enviamos la confirmación y las respuestas?'],
    ui: 'text',
    ph: 'correo@ejemplo.com',
  },
  {
    k: 'telefono',
    t: 'Contacto',
    bot: ['¿Y un número de teléfono donde podamos ubicarlo si necesitamos ampliar la información?'],
    ui: 'text',
    ph: 'Celular o fijo con indicativo',
  },
  {
    k: 'ciudad',
    t: 'Ubicación',
    bot: ['¿Desde qué ciudad o municipio nos escribe? Así asignamos su caso a la regional correcta.'],
    ui: 'city',
  },
  {
    k: 'tipo',
    t: 'Tipo de solicitud',
    bot: [
      '¿Qué tipo de solicitud desea presentar? Si no está seguro, escoja la que más se parezca: nosotros la reclasificamos si hace falta.',
    ],
    ui: 'type',
  },
  {
    k: 'descripcion',
    t: 'Descripción',
    bot: [
      'Cuéntenos qué pasó, con sus propias palabras.<span class="hint">Puede incluir fechas, entidades involucradas y lo que ha hecho hasta ahora. No se preocupe por la redacción.</span>',
    ],
    ui: 'area',
  },
  {
    k: 'archivos',
    t: 'Soportes',
    bot: [
      '¿Tiene documentos que soporten su caso? Puede adjuntar fotos, órdenes médicas, facturas o respuestas que le hayan dado.<span class="hint">Es opcional. Puede continuar sin adjuntar nada.</span>',
    ],
    ui: 'files',
  },
  {
    k: 'consentimiento',
    t: 'Autorización',
    bot: ['Ya casi terminamos. Para radicar necesitamos su autorización para tratar los datos personales que nos entregó.'],
    ui: 'consent',
  },
];
