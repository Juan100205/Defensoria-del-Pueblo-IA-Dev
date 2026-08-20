-- ============================================================
-- Usuarios de prueba
-- ============================================================
-- Cada usuario tiene contraseña: Defensoria2026!
-- ============================================================

-- Función SECURITY DEFINER para insertar en auth.users
-- (la tabla auth.users es propiedad de supabase_auth_admin,
--  y las migraciones corren como postgres)
CREATE OR REPLACE FUNCTION seed_test_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpiar datos anteriores si existen
  DELETE FROM auth.users WHERE email IN (
    'admin@defensoria.gov.co',
    'coordinador@defensoria.gov.co',
    'analista@defensoria.gov.co',
    'consulta@defensoria.gov.co'
  );

  -- 1) Administrador
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, confirmation_token, recovery_token, raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@defensoria.gov.co',
    crypt('Defensoria2026!', gen_salt('bf')),
    now(), now(), now(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    '{"provider":"email","providers":["email"]}',
    '{}'
  );

  -- 2) Coordinador
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, confirmation_token, recovery_token, raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'coordinador@defensoria.gov.co',
    crypt('Defensoria2026!', gen_salt('bf')),
    now(), now(), now(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    '{"provider":"email","providers":["email"]}',
    '{}'
  );

  -- 3) Analista
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, confirmation_token, recovery_token, raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'analista@defensoria.gov.co',
    crypt('Defensoria2026!', gen_salt('bf')),
    now(), now(), now(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    '{"provider":"email","providers":["email"]}',
    '{}'
  );

  -- 4) Consulta
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, confirmation_token, recovery_token, raw_app_meta_data, raw_user_meta_data
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'consulta@defensoria.gov.co',
    crypt('Defensoria2026!', gen_salt('bf')),
    now(), now(), now(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    '{"provider":"email","providers":["email"]}',
    '{}'
  );
END;
$$;

-- Ejecutar la función
SELECT seed_test_users();

-- Limpiar la función temporal
DROP FUNCTION seed_test_users();

-- Asignar roles en profiles
UPDATE profiles SET full_name = 'Administrador General', role = 'administrador'
  WHERE id IN (SELECT id FROM auth.users WHERE email = 'admin@defensoria.gov.co');

UPDATE profiles SET full_name = 'María García López', role = 'coordinador'
  WHERE id IN (SELECT id FROM auth.users WHERE email = 'coordinador@defensoria.gov.co');

UPDATE profiles SET full_name = 'Carlos Pérez Martínez', role = 'analista'
  WHERE id IN (SELECT id FROM auth.users WHERE email = 'analista@defensoria.gov.co');

UPDATE profiles SET full_name = 'Ana López Rodríguez', role = 'consulta'
  WHERE id IN (SELECT id FROM auth.users WHERE email = 'consulta@defensoria.gov.co');

-- ============================================================
-- Casos de prueba
-- ============================================================

DO $$
DECLARE
  v_admin_id UUID;
  v_coord_id UUID;
  v_analista_id UUID;
  v_case1_id UUID;
  v_case2_id UUID;
  v_case3_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@defensoria.gov.co';
  SELECT id INTO v_coord_id FROM auth.users WHERE email = 'coordinador@defensoria.gov.co';
  SELECT id INTO v_analista_id FROM auth.users WHERE email = 'analista@defensoria.gov.co';

  INSERT INTO cases (
    case_number, citizen_name, citizen_doc_type, citizen_doc, citizen_email, citizen_phone,
    citizen_dept, citizen_muni, complaint_type, description, channel, status, assigned_to,
    created_by, urgency, created_at
  ) VALUES (
    'DP-2026-000001', 'Pedro Ramírez Suárez', 'cc', '80123456', 'pedro.ramirez@email.com', '3101234567',
    'Cundinamarca', 'Bogotá D.C.', 'queja',
    'Mi EPS no me ha respondido la solicitud de autorización de cirugía que presenté hace 45 días.',
    'chatbot', 'en_analisis', v_analista_id, v_coord_id, 'alta', now() - interval '3 days'
  ) RETURNING id INTO v_case1_id;

  INSERT INTO cases (
    case_number, citizen_name, citizen_doc_type, citizen_doc, citizen_email, citizen_phone,
    citizen_dept, citizen_muni, complaint_type, description, channel, status, assigned_to,
    created_by, urgency, created_at
  ) VALUES (
    'DP-2026-000002', 'María Fernanda Torres', 'cc', '52345678', 'mftorres@email.com', '3159876543',
    'Antioquia', 'Medellín', 'peticion',
    'Solicito información sobre trámites para reclamar una pensión de vejez.',
    'chatbot', 'en_tramite', v_analista_id, v_coord_id, 'media', now() - interval '7 days'
  ) RETURNING id INTO v_case2_id;

  INSERT INTO cases (
    case_number, citizen_name, citizen_doc_type, citizen_doc, citizen_email, citizen_phone,
    citizen_dept, citizen_muni, complaint_type, description, channel, status,
    created_by, urgency, created_at
  ) VALUES (
    'DP-2026-000003', 'Juan David Ospina', 'ce', '1098765432', 'jd.ospina@email.com', '3201112233',
    'Valle del Cauca', 'Cali', 'reclamo',
    'El barrio San Fernando no ha recibido respuesta a la solicitud de mejoramiento de vías.',
    'presencial', 'recibida', v_admin_id, 'baja', now() - interval '1 day'
  ) RETURNING id INTO v_case3_id;

  INSERT INTO case_messages (case_id, sender_id, content, message_type) VALUES
    (v_case1_id, v_coord_id, 'Caso escalado por falta de respuesta de la EPS.', 'internal'),
    (v_case1_id, v_analista_id, 'Se realizó contacto con la EPS. Pendiente respuesta.', 'note');

  INSERT INTO active_alerts (case_id, alert_type, severity, message, acknowledged) VALUES
    (v_case1_id, 'sla_breach', 'high', 'La EPS no ha respondido en 45 días. SLA superado.', false),
    (v_case2_id, 'escalation', 'medium', 'Caso en trámite por más de 7 días sin actualización.', false);
END $$;
