-- ============================================================
-- 003_functions.sql
-- ============================================================
-- Funciones de base de datos, triggers y stored procedures
-- ============================================================


-- ─────────────────────────────────────────────────────────
-- TRIGGER: Auto-actualizar updated_at
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER trigger_cases_updated_at
BEFORE UPDATE ON cases
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER trigger_settings_updated_at
BEFORE UPDATE ON system_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


-- ─────────────────────────────────────────────────────────
-- FUNCION: Generar número de radicado
-- Formato: DP-YYYY-NNNNNN
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
  year_str TEXT;
BEGIN

  year_str := to_char(now(), 'YYYY');

  SELECT COALESCE(
    MAX(
      CASE
        WHEN case_number LIKE 'DP-' || year_str || '-%'
        THEN CAST(SUBSTRING(case_number FROM 11) AS INTEGER)
        ELSE 0
      END
    ),
    0
  ) + 1
  INTO next_num
  FROM cases;

  NEW.case_number :=
    'DP-' ||
    year_str ||
    '-' ||
    LPAD(next_num::TEXT, 6, '0');

  RETURN NEW;

END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_generate_case_number
BEFORE INSERT ON cases
FOR EACH ROW
WHEN (NEW.case_number IS NULL OR NEW.case_number = '')
EXECUTE FUNCTION generate_case_number();


-- ─────────────────────────────────────────────────────────
-- FUNCION: Calcular fecha de vencimiento
-- 15 días hábiles
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_due_date()
RETURNS TRIGGER AS $$
DECLARE
  business_days INTEGER := 0;
  v_current_date DATE := NEW.created_at::DATE;
BEGIN

  WHILE business_days < 15 LOOP

    -- Avanzar un día
    v_current_date := v_current_date + 1;

    -- PostgreSQL:
    -- 0 = domingo
    -- 6 = sábado
    IF EXTRACT(DOW FROM v_current_date) NOT IN (0, 6) THEN
      business_days := business_days + 1;
    END IF;

  END LOOP;

  NEW.due_date := v_current_date;

  RETURN NEW;

END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_calculate_due_date
BEFORE INSERT ON cases
FOR EACH ROW
WHEN (NEW.due_date IS NULL)
EXECUTE FUNCTION calculate_due_date();


-- ─────────────────────────────────────────────────────────
-- FUNCION: Auto-crear perfil al registrarse un usuario
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN

  INSERT INTO profiles (
    id,
    full_name,
    email,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.email
    ),
    NEW.email,
    COALESCE(
      (NEW.raw_user_meta_data ->> 'role')::user_role,
      'consulta'
    )
  );

  RETURN NEW;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();


-- ─────────────────────────────────────────────────────────
-- FUNCION: Registrar mensaje de sistema al cambiar estado
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN

  IF OLD.status IS DISTINCT FROM NEW.status THEN

    INSERT INTO case_messages (
      case_id,
      author,
      message,
      is_system
    )
    VALUES (
      NEW.id,
      'Sistema',
      'Estado cambiado de "' ||
      OLD.status ||
      '" a "' ||
      NEW.status ||
      '"',
      true
    );

  END IF;

  RETURN NEW;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE TRIGGER trigger_log_status_change
AFTER UPDATE ON cases
FOR EACH ROW
EXECUTE FUNCTION log_status_change();


-- ─────────────────────────────────────────────────────────
-- FUNCION: Obtener estadísticas del dashboard
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_cases BIGINT,
  active_cases BIGINT,
  urgent_cases BIGINT,
  overdue_cases BIGINT,
  resolved_this_month BIGINT,
  avg_response_days NUMERIC
) AS $$
BEGIN

  RETURN QUERY
  SELECT

    (
      SELECT COUNT(*)
      FROM cases
    )::BIGINT,

    (
      SELECT COUNT(*)
      FROM cases
      WHERE status NOT IN ('finalizada')
    )::BIGINT,

    (
      SELECT COUNT(*)
      FROM cases
      WHERE urgency = 'alta'
      AND status NOT IN ('finalizada')
    )::BIGINT,

    (
      SELECT COUNT(*)
      FROM cases
      WHERE due_date < CURRENT_DATE
      AND status NOT IN ('finalizada')
    )::BIGINT,

    (
      SELECT COUNT(*)
      FROM cases
      WHERE status = 'finalizada'
      AND resolved_at >= date_trunc('month', now())
    )::BIGINT,

    (
      SELECT AVG(
        EXTRACT(
          EPOCH FROM (
            resolved_at - created_at
          )
        ) / 86400
      )
      FROM cases
      WHERE resolved_at IS NOT NULL
      AND created_at >= now() - INTERVAL '30 days'
    )::NUMERIC;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────
-- FUNCION: Obtener alertas activas
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_active_alerts()
RETURNS TABLE (
  alert_type TEXT,
  severity TEXT,
  title TEXT,
  description TEXT,
  case_number TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN

  RETURN QUERY

  -- Casos urgentes sin asignar
  SELECT
    'unassigned_urgent'::TEXT,
    'red'::TEXT,
    'Caso urgente sin asignar'::TEXT,
    c.citizen_name || ' — ' || c.description,
    c.case_number,
    c.created_at
  FROM cases c
  WHERE c.urgency = 'alta'
    AND c.assigned_to IS NULL
    AND c.status NOT IN ('finalizada')

  UNION ALL

  -- Casos vencidos
  SELECT
    'overdue'::TEXT,
    'red'::TEXT,
    'Caso vencido'::TEXT,
    c.case_number ||
      ' venció el ' ||
      c.due_date::TEXT,
    c.case_number,
    c.created_at
  FROM cases c
  WHERE c.due_date < CURRENT_DATE
    AND c.status NOT IN ('finalizada')

  UNION ALL

  -- Próximos a vencer
  SELECT
    'due_soon'::TEXT,
    'gold'::TEXT,
    'Próximo a vencer'::TEXT,
    c.case_number ||
      ' vence el ' ||
      c.due_date::TEXT,
    c.case_number,
    c.created_at
  FROM cases c
  WHERE c.due_date BETWEEN
    CURRENT_DATE
    AND CURRENT_DATE + 3
    AND c.status NOT IN ('finalizada')

  ORDER BY
    CASE
      WHEN alert_type = 'unassigned_urgent' THEN 1
      WHEN alert_type = 'overdue' THEN 2
      ELSE 3
    END;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────
-- FUNCION: Buscar casos
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION search_cases(
  p_query TEXT DEFAULT NULL,
  p_status case_status DEFAULT NULL,
  p_department TEXT DEFAULT NULL,
  p_complaint_type complaint_type DEFAULT NULL,
  p_urgency urgency_level DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  case_number TEXT,
  citizen_name TEXT,
  citizen_doc TEXT,
  complaint_type complaint_type,
  theme_name TEXT,
  subject_text TEXT,
  citizen_dept TEXT,
  citizen_muni TEXT,
  status case_status,
  urgency urgency_level,
  assigned_name TEXT,
  created_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
DECLARE
  v_offset INTEGER;
BEGIN

  v_offset :=
    (p_page - 1) * p_page_size;

  RETURN QUERY

  WITH filtered AS (

    SELECT
      c.*,
      t.name AS theme_name,
      p.full_name AS assigned_name,
      COUNT(*) OVER() AS total_count

    FROM cases c

    LEFT JOIN themes t
      ON t.id = c.theme_id

    LEFT JOIN profiles p
      ON p.id = c.assigned_to

    WHERE

      (
        p_query IS NULL
        OR p_query = ''
        OR c.case_number ILIKE '%' || p_query || '%'
        OR c.citizen_name ILIKE '%' || p_query || '%'
        OR c.subject_text ILIKE '%' || p_query || '%'
      )

      AND (
        p_status IS NULL
        OR c.status = p_status
      )

      AND (
        p_department IS NULL
        OR p_department = ''
        OR c.citizen_dept = p_department
      )

      AND (
        p_complaint_type IS NULL
        OR c.complaint_type = p_complaint_type
      )

      AND (
        p_urgency IS NULL
        OR c.urgency = p_urgency
      )
  )

  SELECT
    f.id,
    f.case_number,
    f.citizen_name,
    f.citizen_doc,
    f.complaint_type,
    f.theme_name,
    f.subject_text,
    f.citizen_dept,
    f.citizen_muni,
    f.status,
    f.urgency,
    f.assigned_name,
    f.created_at,
    f.total_count

  FROM filtered f

  ORDER BY f.created_at DESC

  LIMIT p_page_size
  OFFSET v_offset;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────
-- FUNCION: Reasignar caso
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION reassign_case(
  p_case_id UUID,
  p_new_assignee UUID,
  p_note TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_old_assignee UUID;
  v_old_name TEXT;
  v_new_name TEXT;
BEGIN

  SELECT assigned_to
  INTO v_old_assignee
  FROM cases
  WHERE id = p_case_id;


  SELECT full_name
  INTO v_old_name
  FROM profiles
  WHERE id = v_old_assignee;


  SELECT full_name
  INTO v_new_name
  FROM profiles
  WHERE id = p_new_assignee;


  UPDATE cases

  SET
    assigned_to = p_new_assignee,
    status = 'asignada'

  WHERE id = p_case_id;


  INSERT INTO case_messages (
    case_id,
    author,
    message,
    is_system
  )
  VALUES (
    p_case_id,
    'Sistema',
    'Caso reasignado de ' ||
    COALESCE(v_old_name, 'Sin asignar') ||
    ' a ' ||
    v_new_name,
    true
  );


  IF p_note IS NOT NULL
     AND p_note != '' THEN

    INSERT INTO case_messages (
      case_id,
      author,
      message,
      is_system
    )
    VALUES (
      p_case_id,
      'Sistema',
      p_note,
      true
    );

  END IF;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;