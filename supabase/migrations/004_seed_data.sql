-- ============================================================
-- 004_seed_data.sql
-- Datos iniciales: departments, themes, types, settings
-- ============================================================

-- ─────────────────────────────────────────────────────────
-- DEPARTAMENTOS
-- ─────────────────────────────────────────────────────────

INSERT INTO departments (name) VALUES
  ('Antioquia'),
  ('Bogotá D.C.'),
  ('Valle del Cauca'),
  ('Atlántico'),
  ('Santander'),
  ('Nariño'),
  ('Bolívar'),
  ('Cundinamarca'),
  ('Norte de Santander'),
  ('Chocó'),
  ('Cauca'),
  ('Magdalena'),
  ('Córdoba'),
  ('Huila'),
  ('Meta'),
  ('Amazonas');

-- ─────────────────────────────────────────────────────────
-- MUNICIPIOS
-- ─────────────────────────────────────────────────────────

INSERT INTO municipalities (department_id, name)
SELECT d.id, m.name
FROM departments d
JOIN (VALUES
  ('Antioquia', 'Medellín'),
  ('Antioquia', 'Apartadó'),
  ('Antioquia', 'Turbo'),
  ('Bogotá D.C.', 'Bogotá D.C.'),
  ('Valle del Cauca', 'Cali'),
  ('Valle del Cauca', 'Buenaventura'),
  ('Valle del Cauca', 'Palmira'),
  ('Atlántico', 'Barranquilla'),
  ('Atlántico', 'Soledad'),
  ('Santander', 'Bucaramanga'),
  ('Santander', 'Barrancabermeja'),
  ('Nariño', 'Pasto'),
  ('Nariño', 'Tumaco'),
  ('Bolívar', 'Cartagena'),
  ('Bolívar', 'Magangué'),
  ('Cundinamarca', 'Soacha'),
  ('Cundinamarca', 'Girardot'),
  ('Norte de Santander', 'Cúcuta'),
  ('Norte de Santander', 'Ocaña'),
  ('Chocó', 'Quibdó'),
  ('Chocó', 'Istmina'),
  ('Cauca', 'Popayán'),
  ('Cauca', 'Santander de Quilichao'),
  ('Magdalena', 'Santa Marta'),
  ('Magdalena', 'Ciénaga'),
  ('Córdoba', 'Montería'),
  ('Córdoba', 'Lorica'),
  ('Huila', 'Neiva'),
  ('Huila', 'Pitalito'),
  ('Meta', 'Villavicencio'),
  ('Meta', 'Granada'),
  ('Amazonas', 'Leticia')
) AS m(dept_name, name) ON d.name = m.dept_name;

-- ─────────────────────────────────────────────────────────
-- TIPOS DE SOLICITUD
-- ─────────────────────────────────────────────────────────

INSERT INTO complaint_types (name, slug) VALUES
  ('Petición', 'peticion'),
  ('Queja', 'queja'),
  ('Reclamo', 'reclamo'),
  ('Sugerencia', 'sugerencia'),
  ('Denuncia DDHH', 'denuncia_ddhh'),
  ('Tutela', 'tutela');

-- ─────────────────────────────────────────────────────────
-- TEMAS
-- ─────────────────────────────────────────────────────────

INSERT INTO themes (name, slug) VALUES
  ('Salud', 'salud'),
  ('Servicios públicos', 'servicios_publicos'),
  ('Víctimas del conflicto', 'victimas_conflicto'),
  ('Población migrante', 'poblacion_migrante'),
  ('Educación', 'educacion'),
  ('Trabajo', 'trabajo'),
  ('Vivienda', 'vivienda'),
  ('Niñez y adolescencia', 'ninez_adolescencia'),
  ('Personas privadas de la libertad', 'personas_privadas'),
  ('Medio ambiente', 'medio_ambiente');

-- ─────────────────────────────────────────────────────────
-- ASUNTOS POR TEMA
-- ─────────────────────────────────────────────────────────

INSERT INTO subjects (theme_id, name)
SELECT t.id, s.name
FROM themes t
JOIN (VALUES
  ('Salud', 'Negación de autorización para cirugía'),
  ('Salud', 'Demora en entrega de medicamentos'),
  ('Salud', 'Traslado de EPS no aprobado'),
  ('Salud', 'Falta de asignación de cita con especialista'),
  ('Servicios públicos', 'Cobros no autorizados en factura de energía'),
  ('Servicios públicos', 'Suspensión de acueducto sin previo aviso'),
  ('Servicios públicos', 'Facturación irregular de gas domiciliario'),
  ('Víctimas del conflicto', 'Demora en indemnización administrativa'),
  ('Víctimas del conflicto', 'Solicitud de inclusión en el registro de víctimas'),
  ('Víctimas del conflicto', 'Falta de acompañamiento en retorno'),
  ('Población migrante', 'Barreras para acceso a atención en salud'),
  ('Población migrante', 'Demora en trámite de permiso de permanencia'),
  ('Educación', 'Negación de cupo escolar'),
  ('Educación', 'Cobro indebido de matrícula'),
  ('Educación', 'Falta de transporte escolar rural'),
  ('Trabajo', 'Incumplimiento en pago de salarios'),
  ('Trabajo', 'Despido durante licencia médica'),
  ('Vivienda', 'Demora en subsidio de vivienda'),
  ('Vivienda', 'Riesgo de desalojo sin debido proceso'),
  ('Niñez y adolescencia', 'Presunta vulneración de derechos de menor'),
  ('Niñez y adolescencia', 'Falta de atención en programa de primera infancia'),
  ('Personas privadas de la libertad', 'Condiciones de reclusión'),
  ('Personas privadas de la libertad', 'Falta de atención médica intramural'),
  ('Medio ambiente', 'Contaminación de fuente hídrica'),
  ('Medio ambiente', 'Afectación por actividad minera')
) AS s(theme_name, name) ON t.name = s.theme_name;

-- ─────────────────────────────────────────────────────────
-- DEPENDENCIAS INTERNAS
-- ─────────────────────────────────────────────────────────

INSERT INTO internal_dependencies (name) VALUES
  ('Dirección Nacional'),
  ('Delegada para la Salud'),
  ('Delegada para Víctimas'),
  ('Regional Antioquia'),
  ('Regional Valle'),
  ('Regional Atlántico'),
  ('Regional Nariño'),
  ('Regional Santander'),
  ('Oficina de Planeación'),
  ('Oficina Jurídica');

-- ─────────────────────────────────────────────────────────
-- CONFIGURACIÓN DEL SISTEMA (defaults)
-- ─────────────────────────────────────────────────────────

INSERT INTO system_settings (key, value, value_type, category, description) VALUES
  -- Asistente de radicación
  ('chatbot_greet_by_name',        'true'::JSONB,  'boolean', 'chatbot', 'El asistente usa el nombre desde el segundo paso'),
  ('chatbot_allow_correction',     'true'::JSONB,  'boolean', 'chatbot', 'El ciudadano escribe "corregir" para devolverse'),
  ('chatbot_require_attachments',  'false'::JSONB, 'boolean', 'chatbot', 'Exige al menos un soporte antes de radicar'),
  ('chatbot_satisfaction_survey',  'true'::JSONB,  'boolean', 'chatbot', 'Una pregunta después de mostrar el radicado'),

  -- Reglas de priorización
  ('rule_minor_involved',          'true'::JSONB,  'boolean', 'rules', 'Marca urgencia alta automáticamente si hay menores'),
  ('rule_elderly_health',          'true'::JSONB,  'boolean', 'rules', 'Marca urgencia alta si adulto mayor + salud'),
  ('rule_vital_risk_words',        'true'::JSONB,  'boolean', 'rules', 'Notifica al coordinador si detecta palabras de riesgo vital'),
  ('rule_early_alert_municipality','true'::JSONB,  'boolean', 'rules', 'Prioriza y asigna a la regional si municipio tiene alerta'),
  ('rule_reincidence',             'false'::JSONB, 'boolean', 'rules', 'Agrupa el caso con el expediente anterior'),

  -- Términos y notificaciones
  ('notify_deadline_reminder',     'true'::JSONB,  'boolean', 'notifications', 'Recordatorio a 3 días del vencimiento'),
  ('notify_auto_escalation',      'true'::JSONB,  'boolean', 'notifications', 'Escalamiento automático al vencer'),
  ('notify_citizen_status_change', 'true'::JSONB,  'boolean', 'notifications', 'Notificar al ciudadano en cada cambio de estado'),
  ('notify_daily_summary',         'false'::JSONB, 'boolean', 'notifications', 'Resumen diario para coordinadores a las 18:00'),

  -- IA
  ('ai_model_classification',      '"gpt-4o"'::JSONB,   'string', 'ai', 'Modelo para clasificación de casos'),
  ('ai_model_summarization',       '"gpt-4o"'::JSONB,   'string', 'ai', 'Modelo para resumen de casos'),
  ('ai_model_legal_analysis',      '"gpt-4o"'::JSONB,   'string', 'ai', 'Modelo para análisis jurídico'),
  ('ai_model_vision',              '"gpt-4o"'::JSONB,   'string', 'ai', 'Modelo para procesamiento de documentos'),
  ('ai_temperature',               '0.3'::JSONB,        'number', 'ai', 'Temperatura para generación de texto'),
  ('ai_max_tokens',                '2048'::JSONB,       'number', 'ai', 'Máximo de tokens por respuesta'),

  -- Accesibilidad
  ('accessibility_high_contrast',  'false'::JSONB, 'boolean', 'accessibility', 'Modo de alto contraste WCAG 2.1 AA'),
  ('accessibility_large_font',     'false'::JSONB, 'boolean', 'accessibility', 'Aumentar tamaño de fuente base'),
  ('accessibility_easy_read',      'true'::JSONB,  'boolean', 'accessibility', 'Lectura fácil en el chatbot'),
  ('accessibility_brand_export',   'true'::JSONB,  'boolean', 'accessibility', 'Marca institucional en exportaciones');
