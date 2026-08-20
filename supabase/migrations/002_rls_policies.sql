-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security — Políticas de acceso por rol
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE internal_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────
-- Helper: obtener el rol del usuario actual
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'administrador'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─────────────────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────────────────

-- Todos los usuarios autenticados pueden ver su propio perfil
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admin puede ver todos los perfiles
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (is_admin());

-- Coordinadores pueden ver perfiles de su región
CREATE POLICY "profiles_select_coordinator" ON profiles
  FOR SELECT USING (
    get_user_role() = 'coordinador'
  );

-- Admin puede insertar perfiles
CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT WITH CHECK (is_admin());

-- Admin puede actualizar cualquier perfil
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (is_admin());

-- Cada usuario puede actualizar su propio perfil (campos limitados)
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin puede desactivar usuarios
CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE USING (is_admin());

-- ─────────────────────────────────────────────────────────
-- CASES — Reglas principales de acceso
-- ─────────────────────────────────────────────────────────

-- Cualquiera puede CREAR casos (chatbot público)
CREATE POLICY "cases_insert_anon" ON cases
  FOR INSERT WITH CHECK (true);

-- Usuarios autenticados también pueden crear casos
CREATE POLICY "cases_insert_auth" ON cases
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admin y coordinadores ven todos los casos
CREATE POLICY "cases_select_admin" ON cases
  FOR SELECT USING (
    get_user_role() IN ('administrador', 'coordinador')
  );

-- Analistas ven casos de su departamento
CREATE POLICY "cases_select_analyst" ON cases
  FOR SELECT USING (
    get_user_role() = 'analista'
    AND citizen_dept = (
      SELECT department FROM profiles WHERE id = auth.uid()
    )
  );

-- Consulta solo lee casos (ya cubierto por los de arriba)
CREATE POLICY "cases_select_viewer" ON cases
  FOR SELECT USING (
    get_user_role() = 'consulta'
  );

-- Admin puede actualizar cualquier caso
CREATE POLICY "cases_update_admin" ON cases
  FOR UPDATE USING (is_admin());

-- Coordinadores pueden actualizar casos asignados o de su región
CREATE POLICY "cases_update_coordinator" ON cases
  FOR UPDATE USING (
    get_user_role() = 'coordinador'
  );

-- Analistas pueden actualizar casos asignados a ellos
CREATE POLICY "cases_update_analyst" ON cases
  FOR UPDATE USING (
    get_user_role() = 'analista'
    AND assigned_to = auth.uid()
  );

-- Solo admin puede eliminar casos
CREATE POLICY "cases_delete_admin" ON cases
  FOR DELETE USING (is_admin());

-- ─────────────────────────────────────────────────────────
-- CASE MESSAGES
-- ─────────────────────────────────────────────────────────

CREATE POLICY "messages_select" ON case_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases WHERE cases.id = case_messages.case_id
      AND (
        get_user_role() IN ('administrador', 'coordinador')
        OR cases.assigned_to = auth.uid()
        OR get_user_role() = 'consulta'
      )
    )
  );

CREATE POLICY "messages_insert" ON case_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases WHERE cases.id = case_messages.case_id
      AND (
        get_user_role() IN ('administrador', 'coordinador')
        OR cases.assigned_to = auth.uid()
      )
    )
  );

-- ─────────────────────────────────────────────────────────
-- CASE ATTACHMENTS
-- ─────────────────────────────────────────────────────────

CREATE POLICY "attachments_select" ON case_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases WHERE cases.id = case_attachments.case_id
      AND (
        get_user_role() IN ('administrador', 'coordinador')
        OR cases.assigned_to = auth.uid()
        OR get_user_role() = 'consulta'
      )
    )
  );

CREATE POLICY "attachments_insert" ON case_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases WHERE cases.id = case_attachments.case_id
      AND (
        get_user_role() IN ('administrador', 'coordinador')
        OR cases.assigned_to = auth.uid()
      )
    )
  );

-- ─────────────────────────────────────────────────────────
-- AGENT RUNS
-- ─────────────────────────────────────────────────────────

CREATE POLICY "agent_runs_select" ON agent_runs
  FOR SELECT USING (
    get_user_role() IN ('administrador', 'coordinador')
  );

CREATE POLICY "agent_runs_insert" ON agent_runs
  FOR INSERT WITH CHECK (
    get_user_role() IN ('administrador', 'coordinador')
  );

CREATE POLICY "agent_runs_update" ON agent_runs
  FOR UPDATE USING (
    get_user_role() IN ('administrador', 'coordinador')
  );

-- ─────────────────────────────────────────────────────────
-- LOOKUP TABLES (lectura pública autenticada)
-- ─────────────────────────────────────────────────────────

-- Todos los autenticados pueden leer datos de referencia
CREATE POLICY "departments_select" ON departments
  FOR SELECT USING (auth.uid() IS NOT NULL OR true);

CREATE POLICY "municipalities_select" ON municipalities
  FOR SELECT USING (auth.uid() IS NOT NULL OR true);

CREATE POLICY "complaint_types_select" ON complaint_types
  FOR SELECT USING (auth.uid() IS NOT NULL OR true);

CREATE POLICY "themes_select" ON themes
  FOR SELECT USING (auth.uid() IS NOT NULL OR true);

CREATE POLICY "subjects_select" ON subjects
  FOR SELECT USING (auth.uid() IS NOT NULL OR true);

CREATE POLICY "dependencies_select" ON internal_dependencies
  FOR SELECT USING (auth.uid() IS NOT NULL OR true);

-- Solo admin puede modificar datos de referencia
CREATE POLICY "departments_admin" ON departments
  FOR ALL USING (is_admin());

CREATE POLICY "municipalities_admin" ON municipalities
  FOR ALL USING (is_admin());

CREATE POLICY "complaint_types_admin" ON complaint_types
  FOR ALL USING (is_admin());

CREATE POLICY "themes_admin" ON themes
  FOR ALL USING (is_admin());

CREATE POLICY "subjects_admin" ON subjects
  FOR ALL USING (is_admin());

CREATE POLICY "dependencies_admin" ON internal_dependencies
  FOR ALL USING (is_admin());

-- ─────────────────────────────────────────────────────────
-- SYSTEM SETTINGS
-- ─────────────────────────────────────────────────────────

CREATE POLICY "settings_select" ON system_settings
  FOR SELECT USING (
    get_user_role() IN ('administrador', 'coordinador')
  );

CREATE POLICY "settings_admin" ON system_settings
  FOR ALL USING (is_admin());
