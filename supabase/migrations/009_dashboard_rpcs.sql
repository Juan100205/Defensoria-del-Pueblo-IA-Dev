-- ============================================================
-- 009_dashboard_rpcs.sql
-- Funciones RPC para paneles del dashboard en vivo
-- ============================================================

-- ─────────────────────────────────────────────────────────
-- Casos por departamento (mapa territorial)
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_cases_by_department()
RETURNS TABLE (
  department TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.citizen_dept AS department,
    COUNT(*) AS count
  FROM cases c
  WHERE c.citizen_dept IS NOT NULL
  GROUP BY c.citizen_dept
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────
-- Casos por semana (últimas 12 semanas)
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_cases_by_week()
RETURNS TABLE (
  week_label TEXT,
  received BIGINT,
  resolved BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH weeks AS (
    SELECT
      'S' || EXTRACT(WEEK FROM d)::TEXT AS wk,
      d::DATE AS week_start
    FROM generate_series(
      now() - INTERVAL '84 days',
      now()::DATE,
      '7 days'::INTERVAL
    ) d
  )
  SELECT
    w.wk AS week_label,
    COALESCE(
      (SELECT COUNT(*) FROM cases c
       WHERE EXTRACT(WEEK FROM c.created_at) = EXTRACT(WEEK FROM w.week_start)
         AND EXTRACT(YEAR FROM c.created_at) = EXTRACT(YEAR FROM w.week_start)),
      0
    ) AS received,
    COALESCE(
      (SELECT COUNT(*) FROM cases c
       WHERE c.resolved_at IS NOT NULL
         AND EXTRACT(WEEK FROM c.resolved_at) = EXTRACT(WEEK FROM w.week_start)
         AND EXTRACT(YEAR FROM c.resolved_at) = EXTRACT(YEAR FROM w.week_start)),
      0
    ) AS resolved
  FROM weeks w
  ORDER BY w.week_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────
-- Casos por tipo de solicitud
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_cases_by_type()
RETURNS TABLE (
  type_name TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE c.complaint_type
      WHEN 'peticion' THEN 'Petición'
      WHEN 'queja' THEN 'Queja'
      WHEN 'reclamo' THEN 'Reclamo'
      WHEN 'sugerencia' THEN 'Sugerencia'
      WHEN 'denuncia_ddhh' THEN 'Denuncia DDHH'
      WHEN 'tutela' THEN 'Tutela'
      ELSE c.complaint_type::TEXT
    END AS type_name,
    COUNT(*) AS count
  FROM cases c
  GROUP BY c.complaint_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────
-- Actividad reciente (últimos 5 eventos)
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_recent_activity()
RETURNS TABLE (
  icon TEXT,
  color TEXT,
  title TEXT,
  subtitle TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY

  -- Últimos casos creados
  SELECT
    'doc'::TEXT AS icon,
    'navy'::TEXT AS color,
    ('Nuevo caso ' || c.case_number)::TEXT AS title,
    (c.citizen_name || ' — ' || LEFT(c.description, 60))::TEXT AS subtitle,
    c.created_at
  FROM cases c
  ORDER BY c.created_at DESC
  LIMIT 3

  UNION ALL

  -- Últimos cambios de estado
  SELECT
    'flow'::TEXT,
    'green',
    ('Caso ' || cm.case_number || ' cambió de estado')::TEXT,
    LEFT(cm.message, 80)::TEXT,
    cm.created_at
  FROM case_messages cm
  JOIN cases c ON c.id = cm.case_id
  WHERE cm.is_system = true
    AND cm.message LIKE 'Estado cambiado%'
  ORDER BY cm.created_at DESC
  LIMIT 3

  ORDER BY created_at DESC
  LIMIT 5;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────
-- Stats del portal (StatsStrip)
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_portal_stats()
RETURNS TABLE (
  total_solicitudes BIGINT,
  avg_response_days NUMERIC,
  on_time_pct NUMERIC,
  regionales BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM cases)::BIGINT,
    COALESCE(
      (SELECT AVG(
        EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400
      ) FROM cases WHERE resolved_at IS NOT NULL
        AND created_at >= date_trunc('year', now())),
      0
    )::NUMERIC,
    COALESCE(
      (SELECT ROUND(
        100.0 * COUNT(*) FILTER (WHERE resolved_at <= due_date) /
        NULLIF(COUNT(*) FILTER (WHERE status = 'finalizada'), 0),
        1
      ) FROM cases WHERE status = 'finalizada'),
      96
    )::NUMERIC,
    (SELECT COUNT(DISTINCT citizen_dept) FROM cases WHERE citizen_dept IS NOT NULL)::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
