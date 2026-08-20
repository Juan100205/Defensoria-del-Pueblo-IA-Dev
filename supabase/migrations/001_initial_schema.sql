-- ============================================================
-- 001_initial_schema.sql
-- Defensoría del Pueblo — Esquema completo de base de datos
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────

CREATE TYPE case_status AS ENUM (
  'recibida',
  'en_analisis',
  'asignada',
  'en_tramite',
  'finalizada'
);

CREATE TYPE urgency_level AS ENUM ('alta', 'media', 'baja');

CREATE TYPE complaint_type AS ENUM (
  'peticion',
  'queja',
  'reclamo',
  'sugerencia',
  'denuncia_ddhh',
  'tutela'
);

CREATE TYPE user_role AS ENUM (
  'administrador',
  'coordinador',
  'analista',
  'consulta'
);

CREATE TYPE document_type AS ENUM (
  'cc',
  'ce',
  'ti',
  'pasaporte',
  'nit'
);

CREATE TYPE attachment_category AS ENUM (
  'imagen',
  'documento',
  'audio',
  'video'
);

CREATE TYPE agent_status AS ENUM (
  'idle',
  'running',
  'done',
  'failed'
);

CREATE TYPE setting_value_type AS ENUM (
  'boolean',
  'string',
  'number',
  'json'
);

-- ─────────────────────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────────────────────

-- Perfiles de funcionarios (vinculado a auth.users)
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL,
  role         user_role NOT NULL DEFAULT 'consulta',
  department   TEXT,
  phone        TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sedes regionales / departamentos
CREATE TABLE departments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT true
);

-- Municipios por departamento
CREATE TABLE municipalities (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  UNIQUE (department_id, name)
);

-- Tipos de solicitud (lookup)
CREATE TABLE complaint_types (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  TEXT NOT NULL UNIQUE,
  slug  TEXT NOT NULL UNIQUE
);

-- Temas / áreas temáticas (lookup)
CREATE TABLE themes (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  TEXT NOT NULL UNIQUE,
  slug  TEXT NOT NULL UNIQUE
);

-- Asuntos por tema (lookup)
CREATE TABLE subjects (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  theme_id  UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  name      TEXT NOT NULL
);

-- Dependencias internas de la Defensoría
CREATE TABLE internal_dependencies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT true
);

-- ─────────────────────────────────────────────────────────
-- CASOS (tabla principal)
-- ─────────────────────────────────────────────────────────

CREATE TABLE cases (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number      TEXT NOT NULL UNIQUE,

  -- Ciudadano
  citizen_name     TEXT NOT NULL,
  citizen_doc_type document_type NOT NULL DEFAULT 'cc',
  citizen_doc      TEXT NOT NULL,
  citizen_email    TEXT,
  citizen_phone    TEXT,
  citizen_dept     TEXT,
  citizen_muni     TEXT,
  citizen_consent  BOOLEAN NOT NULL DEFAULT false,

  -- Clasificación
  complaint_type   complaint_type NOT NULL,
  theme_id         UUID REFERENCES themes(id),
  subject_id       UUID REFERENCES subjects(id),
  subject_text     TEXT,
  description      TEXT NOT NULL,

  -- Estado
  status           case_status NOT NULL DEFAULT 'recibida',
  urgency          urgency_level NOT NULL DEFAULT 'media',

  -- Asignación
  assigned_to      UUID REFERENCES profiles(id),
  dependency_id    UUID REFERENCES internal_dependencies(id),

  -- IA
  ai_summary       TEXT,
  ai_tags          TEXT[] DEFAULT '{}',
  ai_suggestions   TEXT[] DEFAULT '{}',
  ai_duplicate_of  UUID REFERENCES cases(id),
  ai_processed     BOOLEAN NOT NULL DEFAULT false,

  -- Canales
  channel          TEXT NOT NULL DEFAULT 'chatbot',

  -- Términos
  due_date         DATE,
  resolved_at      TIMESTAMPTZ,

  -- Auditoría
  created_by       UUID REFERENCES profiles(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mensajes / cronología del caso
CREATE TABLE case_messages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id    UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  author_id  UUID REFERENCES profiles(id),
  author     TEXT NOT NULL DEFAULT 'Sistema',
  message    TEXT NOT NULL,
  is_system  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Archivos adjuntos
CREATE TABLE case_attachments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id    UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_name  TEXT NOT NULL,
  file_size  BIGINT,
  file_type  TEXT,
  category   attachment_category,
  bucket     TEXT NOT NULL DEFAULT 'case-attachments',
  path       TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Resultados del pipeline de agentes IA
CREATE TABLE agent_runs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id       UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  agent_name    TEXT NOT NULL,
  status        agent_status NOT NULL DEFAULT 'idle',
  input_data    JSONB,
  output_data   JSONB,
  error_message TEXT,
  duration_ms   INTEGER,
  model_used    TEXT,
  tokens_used   INTEGER,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at  TIMESTAMPTZ
);

-- Configuración del sistema (key-value)
CREATE TABLE system_settings (
  key           TEXT PRIMARY KEY,
  value         JSONB NOT NULL,
  value_type    setting_value_type NOT NULL,
  category      TEXT NOT NULL DEFAULT 'general',
  description   TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────
-- ÍNDICES
-- ─────────────────────────────────────────────────────────

CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_urgency ON cases(urgency);
CREATE INDEX idx_cases_dept ON cases(citizen_dept);
CREATE INDEX idx_cases_complaint_type ON cases(complaint_type);
CREATE INDEX idx_cases_created_at ON cases(created_at DESC);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_case_messages_case_id ON case_messages(case_id);
CREATE INDEX idx_case_messages_created_at ON case_messages(created_at DESC);
CREATE INDEX idx_case_attachments_case_id ON case_attachments(case_id);
CREATE INDEX idx_agent_runs_case_id ON agent_runs(case_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_department ON profiles(department);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_municipalities_dept ON municipalities(department_id);
CREATE INDEX idx_subjects_theme ON subjects(theme_id);
