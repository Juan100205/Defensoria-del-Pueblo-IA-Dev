export const DEPTOS = [
  'Antioquia', 'Bogotá D.C.', 'Valle del Cauca', 'Atlántico', 'Santander',
  'Nariño', 'Bolívar', 'Cundinamarca', 'Norte de Santander', 'Chocó',
  'Cauca', 'Magdalena', 'Córdoba', 'Huila', 'Meta', 'Amazonas'
];

export const MUNIS: Record<string, string[]> = {
  'Antioquia': ['Medellín', 'Apartadó', 'Turbo'],
  'Bogotá D.C.': ['Bogotá D.C.'],
  'Valle del Cauca': ['Cali', 'Buenaventura', 'Palmira'],
  'Atlántico': ['Barranquilla', 'Soledad'],
  'Santander': ['Bucaramanga', 'Barrancabermeja'],
  'Nariño': ['Pasto', 'Tumaco'],
  'Bolívar': ['Cartagena', 'Magangué'],
  'Cundinamarca': ['Soacha', 'Girardot'],
  'Norte de Santander': ['Cúcuta', 'Ocaña'],
  'Chocó': ['Quibdó', 'Istmina'],
  'Cauca': ['Popayán', 'Santander de Quilichao'],
  'Magdalena': ['Santa Marta', 'Ciénaga'],
  'Córdoba': ['Montería', 'Lorica'],
  'Huila': ['Neiva', 'Pitalito'],
  'Meta': ['Villavicencio', 'Granada'],
  'Amazonas': ['Leticia'],
};

export const TIPOS = ['Petición', 'Queja', 'Reclamo', 'Sugerencia', 'Denuncia DDHH', 'Tutela'] as const;

export const ESTADOS = ['Recibida', 'En análisis', 'Asignada', 'En trámite', 'Finalizada'] as const;

export const TEMAS = [
  'Salud', 'Servicios públicos', 'Víctimas del conflicto', 'Población migrante',
  'Educación', 'Trabajo', 'Vivienda', 'Niñez y adolescencia',
  'Personas privadas de la libertad', 'Medio ambiente'
];

export const ASUNTOS: Record<string, string[]> = {
  'Salud': ['Negación de autorización para cirugía', 'Demora en entrega de medicamentos', 'Traslado de EPS no aprobado', 'Falta de asignación de cita con especialista'],
  'Servicios públicos': ['Cobros no autorizados en factura de energía', 'Suspensión de acueducto sin previo aviso', 'Facturación irregular de gas domiciliario'],
  'Víctimas del conflicto': ['Demora en indemnización administrativa', 'Solicitud de inclusión en el registro de víctimas', 'Falta de acompañamiento en retorno'],
  'Población migrante': ['Barreras para acceso a atención en salud', 'Demora en trámite de permiso de permanencia'],
  'Educación': ['Negación de cupo escolar', 'Cobro indebido de matrícula', 'Falta de transporte escolar rural'],
  'Trabajo': ['Incumplimiento en pago de salarios', 'Despido durante licencia médica'],
  'Vivienda': ['Demora en subsidio de vivienda', 'Riesgo de desalojo sin debido proceso'],
  'Niñez y adolescencia': ['Presunta vulneración de derechos de menor', 'Falta de atención en programa de primera infancia'],
  'Personas privadas de la libertad': ['Condiciones de reclusión', 'Falta de atención médica intramural'],
  'Medio ambiente': ['Contaminación de fuente hídrica', 'Afectación por actividad minera'],
};

export const NOMBRES = [
  'Luisa Fernanda Ospina', 'Carlos Andrés Beltrán', 'María José Restrepo',
  'Jhon Fredy Cárdenas', 'Diana Marcela Quintero', 'Andrés Felipe Salazar',
  'Yurany Paola Mosquera', 'Óscar Iván Peñaloza', 'Claudia Patricia Rojas',
  'Nelson Alberto Gómez', 'Sandra Milena Torres', 'Julián David Arango',
  'Ana Milena Cuesta', 'Wilson Eduardo Rincón', 'Katherine Julieth Vega',
  'Rubén Darío Palacios', 'Leidy Johana Suárez', 'Fabián Ricardo Núñez',
  'Gloria Esperanza Muñoz', 'Héctor Manuel Cabrera',
];

export const FUNCIONARIOS = [
  { n: 'Marcela Ríos Vanegas', r: 'Coordinadora', d: 'Delegada para la Salud', c: 18, l: 'Hace 4 minutos', a: 1, p: ['Ver', 'Editar', 'Asignar', 'Exportar'] },
  { n: 'Julián Ospina Mejía', r: 'Analista', d: 'Regional Antioquia', c: 24, l: 'Hace 22 minutos', a: 1, p: ['Ver', 'Editar'] },
  { n: 'Paula Andrea Cifuentes', r: 'Analista', d: 'Delegada para Víctimas', c: 31, l: 'Hace 1 hora', a: 1, p: ['Ver', 'Editar', 'Exportar'] },
  { n: 'Ricardo Beltrán Nieto', r: 'Administrador', d: 'Dirección Nacional', c: 6, l: 'Hoy, 07:41', a: 1, p: ['Ver', 'Editar', 'Asignar', 'Exportar', 'Configurar'] },
  { n: 'Sara Milena Guerrero', r: 'Analista', d: 'Regional Valle', c: 19, l: 'Ayer, 18:02', a: 1, p: ['Ver', 'Editar'] },
  { n: 'Diego Fernando Lozano', r: 'Consulta', d: 'Oficina de Planeación', c: 0, l: 'Hace 3 días', a: 0, p: ['Ver'] },
  { n: 'Natalia Correa Ríos', r: 'Coordinadora', d: 'Regional Atlántico', c: 22, l: 'Hoy, 09:15', a: 1, p: ['Ver', 'Editar', 'Asignar'] },
];

export const CITIES = [
  { n: 'Bogotá D.C.', x: 168, y: 232, v: 312 },
  { n: 'Medellín', x: 120, y: 158, v: 248 },
  { n: 'Cali', x: 100, y: 236, v: 196 },
  { n: 'Barranquilla', x: 172, y: 66, v: 148 },
  { n: 'Cartagena', x: 150, y: 72, v: 112 },
  { n: 'Bucaramanga', x: 196, y: 134, v: 98 },
  { n: 'Cúcuta', x: 220, y: 114, v: 104 },
  { n: 'Villavicencio', x: 198, y: 232, v: 76 },
  { n: 'Pasto', x: 106, y: 290, v: 82 },
  { n: 'Quibdó', x: 80, y: 150, v: 64 },
  { n: 'Neiva', x: 138, y: 262, v: 58 },
  { n: 'Santa Marta', x: 190, y: 66, v: 70 },
  { n: 'Montería', x: 126, y: 96, v: 54 },
  { n: 'Leticia', x: 192, y: 382, v: 18 },
  { n: 'Popayán', x: 106, y: 258, v: 46 },
];

export const AGENTS = [
  { n: 'Clasificador', d: 'Define tipo, tema y competencia', i: 'tag' as const },
  { n: 'Resumidor', d: 'Condensa el relato en 4 líneas', i: 'doc' as const },
  { n: 'Detector de urgencia', d: 'Evalúa riesgo y términos legales', i: 'fire' as const },
  { n: 'Analizador jurídico', d: 'Identifica derechos y normas aplicables', i: 'scale' as const },
  { n: 'Detector de duplicados', d: 'Busca casos idénticos del mismo ciudadano', i: 'copy' as const },
  { n: 'Validador documental', d: 'Verifica legibilidad de los soportes', i: 'checkc' as const },
  { n: 'Asignador de dependencia', d: 'Propone el área y el responsable', i: 'flow' as const },
];

export type Scene = 'portal' | 'chat' | 'conf' | 'mail' | 'proc' | 'admin';

export type AdminView = 'dash' | 'sol' | 'det' | 'alert' | 'ana' | 'exp' | 'usr' | 'cfg';

export interface SolicitudRecord {
  rad: string;
  nombre: string;
  doc: string;
  correo: string;
  tel: string;
  tipo: string;
  tema: string;
  dep: string;
  muni: string;
  asunto: string;
  estado: string;
  urg: string;
  fecha: string;
  hora: string;
  resp: string;
  dias: number;
}

export interface Funcionario {
  n: string;
  r: string;
  d: string;
  c: number;
  l: string;
  a: number;
  p: string[];
}
