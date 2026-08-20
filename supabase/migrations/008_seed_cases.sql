-- ============================================================
-- 008_seed_cases.sql
-- ~50 casos realistas para alimentar todos los paneles
-- ============================================================

DO $$
DECLARE
  v_admin UUID := '7a65ff8e-8475-4b67-bb6f-aa121c972f2f';
  v_coord UUID := 'd4f995ef-c001-4045-bba4-55135e12a190';
  v_analyst UUID := 'b0b5c3fa-c6ee-4c1b-a834-9eb126b35111';

  v_t_salud UUID := '3e55980e-05e8-42ea-ad25-77cd39119798';
  v_t_serv UUID := '2e13a013-d817-4e17-95f2-e5b3614a4b38';
  v_t_vict UUID := '8ff0f90a-b033-4df7-8dcc-6e640e89be25';
  v_t_migr UUID := '11f9fe6a-c85a-433f-b83b-e35a8d14625f';
  v_t_edu UUID := '5d6c4f55-cfc6-4116-b01d-e62b351a65dc';
  v_t_trab UUID := 'bc353184-2b09-43eb-89bb-256aa29b6a10';
  v_t_viv UUID := 'e86ccd0f-7597-4a06-88d9-56a31a1dca0c';
  v_t_ninez UUID := '0cee0bc5-f941-49fb-a220-f00ccf2ec596';
  v_t_ppl UUID := '3ca734c2-0f8e-41f2-a660-5f3eada7b161';
  v_t_medio UUID := 'b068d3fb-eaf5-4447-8c8f-28ac9f5c1fab';

  v_d_salud UUID := 'c24bcae7-2078-44b6-aff6-105579629855';
  v_d_vict UUID := 'a2512052-f830-40ec-a0ea-32e8f6fc117d';
  v_d_jur UUID := '70473d35-c83a-42e3-a8e8-1d79447332b5';
  v_d_ant UUID := '6bcd835a-2390-40e5-a882-b0a8d46c0814';
  v_d_atl UUID := '29c9abc9-7a36-45d9-8ad6-e78648b8e861';
  v_d_nar UUID := 'f6f2fcd4-5dc5-4fa3-bee7-60bc432758be';
  v_d_sant UUID := '0a03756c-ec5b-423e-b4af-5e5cc525a1a1';
  v_d_val UUID := 'e6643003-70bd-4f7b-a3b9-8b3c82569c9b';

  i INTEGER;
  v_created TIMESTAMPTZ;
  v_due DATE;
  v_status case_status;
  v_urg urgency_level;
  v_type complaint_type;
  v_dept TEXT;
  v_muni TEXT;
  v_theme UUID;
  v_dep UUID;
  v_desc TEXT;
  v_name TEXT;
  v_doc TEXT;
  v_email TEXT;
  v_phone TEXT;
  v_summary TEXT;
  v_tags TEXT[];
  v_channel TEXT;
  v_sensitive BOOLEAN;
  v_assigned UUID;
  v_case_id UUID;
  v_cn TEXT;

BEGIN

  -- Limpiar casos de prueba anteriores
  DELETE FROM case_messages WHERE case_id IN (
    SELECT id FROM cases WHERE case_number LIKE 'DP-2026-00%'
  );
  DELETE FROM cases WHERE case_number LIKE 'DP-2026-00%';

  FOR i IN 1..50 LOOP

    -- Fecha de creación: distribuida en los últimos 90 días
    v_created := now()
      - (floor(random() * 90)::INT || ' days')::INTERVAL
      - (floor(random() * 24)::INT || ' hours')::INTERVAL;

    -- Estado
    IF i <= 5 THEN v_status := 'recibida';
    ELSIF i <= 12 THEN v_status := 'en_analisis';
    ELSIF i <= 25 THEN v_status := 'asignada';
    ELSIF i <= 40 THEN v_status := 'en_tramite';
    ELSE v_status := 'finalizada';
    END IF;

    -- Urgencia
    IF i IN (1,3,7,15,22,30,38) THEN v_urg := 'alta';
    ELSIF i IN (2,5,9,14,19,25,33,41) THEN v_urg := 'media';
    ELSE v_urg := 'baja';
    END IF;

    -- Tipo
    IF i IN (1,8,16,23,31,39,45) THEN v_type := 'peticion';
    ELSIF i IN (2,9,17,24,32,40,46) THEN v_type := 'queja';
    ELSIF i IN (3,10,18,25,33,41,47) THEN v_type := 'reclamo';
    ELSIF i IN (4,11,19,26,34) THEN v_type := 'sugerencia';
    ELSIF i IN (5,12,20,27,35,42,48) THEN v_type := 'denuncia_ddhh';
    ELSE v_type := 'tutela';
    END IF;

    -- Dept/Muni
    IF i % 8 = 0 THEN v_dept := 'Bogotá D.C.'; v_muni := 'Bogotá D.C.';
    ELSIF i % 8 = 1 THEN v_dept := 'Antioquia'; v_muni := 'Medellín';
    ELSIF i % 8 = 2 THEN v_dept := 'Valle del Cauca'; v_muni := 'Cali';
    ELSIF i % 8 = 3 THEN v_dept := 'Atlántico'; v_muni := 'Barranquilla';
    ELSIF i % 8 = 4 THEN v_dept := 'Santander'; v_muni := 'Bucaramanga';
    ELSIF i % 8 = 5 THEN v_dept := 'Nariño'; v_muni := 'Pasto';
    ELSIF i % 8 = 6 THEN v_dept := 'Bolívar'; v_muni := 'Cartagena';
    ELSE v_dept := 'Norte de Santander'; v_muni := 'Cúcuta';
    END IF;

    -- Tema y dependencia
    IF i % 10 = 0 THEN
      v_theme := v_t_salud; v_dep := v_d_salud;
      v_desc := 'La EPS Suramericana negó la autorización para cirugía de reemplazo de rodilla solicitada por el ciudadano. El médico tratante indicó urgencia.';
    ELSIF i % 10 = 1 THEN
      v_theme := v_t_salud; v_dep := v_d_salud;
      v_desc := 'Desde hace 3 meses la EPS no entrega los medicamentos para tratamiento de VIH. El paciente ha tenido que comprar por su cuenta.';
    ELSIF i % 10 = 2 THEN
      v_theme := v_t_salud; v_dep := v_d_salud;
      v_desc := 'Llevan 6 meses esperando cita con neurólogo. La EPS dice que no hay cupos disponibles en la red.';
    ELSIF i % 10 = 3 THEN
      v_theme := v_t_serv; v_dep := v_d_jur;
      v_desc := 'Facturas de energía eléctrica superan $180.000 mensuales para estrato 2. Empresa no responde reclamos.';
    ELSIF i % 10 = 4 THEN
      v_theme := v_t_vict; v_dep := v_d_vict;
      v_desc := 'Solicitud de indemnización administrativa por secuestro presentada hace 18 meses sin respuesta.';
    ELSIF i % 10 = 5 THEN
      v_theme := v_t_edu; v_dep := v_d_ant;
      v_desc := 'Colegio público se niega a matricular al niño de 8 años argumentando que no hay cupo.';
    ELSIF i % 10 = 6 THEN
      v_theme := v_t_migr; v_dep := v_d_atl;
      v_desc := 'Migrante venezolano con enfermedad renal crónica no puede acceder a diálisis. EPS le niega servicio.';
    ELSIF i % 10 = 7 THEN
      v_theme := v_t_trab; v_dep := v_d_jur;
      v_desc := 'Empresa de construcción no paga salarios desde hace 3 meses. 12 trabajadores afectados.';
    ELSIF i % 10 = 8 THEN
      v_theme := v_t_ninez; v_dep := v_d_nar;
      v_desc := 'Niña de 10 años presenta señales de maltrato físico. Padres no la llevan al colegio.';
    ELSE
      v_theme := v_t_medio; v_dep := v_d_nar;
      v_desc := 'Río Mira presenta coloración verdosa y olor fuerte. Comunidades ribereñas sin agua potable.';
    END IF;

    -- Asignatario (algunos sin asignar para alertas)
    IF i IN (4,11,19,27,35) THEN v_assigned := NULL;
    ELSIF i IN (7,14,22,30,38) THEN v_assigned := NULL;
    ELSIF i % 3 = 0 THEN v_assigned := v_analyst;
    ELSIF i % 3 = 1 THEN v_assigned := v_coord;
    ELSE v_assigned := v_analyst;
    END IF;

    -- Nombre
    IF i % 10 = 0 THEN v_name := 'Luisa Fernanda Ospina Gómez'; v_doc := '1032456789'; v_email := 'luisa.ospina@email.com'; v_phone := '3104567890';
    ELSIF i % 10 = 1 THEN v_name := 'Carlos Andrés Beltrán Ruiz'; v_doc := '80123456'; v_email := 'carlos.beltran@email.com'; v_phone := '3151234567';
    ELSIF i % 10 = 2 THEN v_name := 'María José Restrepo Meza'; v_doc := '1023456780'; v_email := 'maria.restrepo@email.com'; v_phone := '3209876543';
    ELSIF i % 10 = 3 THEN v_name := 'Jhon Fredy Cárdenas López'; v_doc := '79876543'; v_email := NULL; v_phone := '3012345678';
    ELSIF i % 10 = 4 THEN v_name := 'Diana Marcela Quintero Vásquez'; v_doc := '1045678901'; v_email := 'diana.quintero@email.com'; v_phone := '3167890123';
    ELSIF i % 10 = 5 THEN v_name := 'Andrés Felipe Salazar Méndez'; v_doc := '80234567'; v_email := 'andres.salazar@email.com'; v_phone := '3183456789';
    ELSIF i % 10 = 6 THEN v_name := 'Yurany Paola Mosquera Ríos'; v_doc := '1034567890'; v_email := NULL; v_phone := '3145678901';
    ELSIF i % 10 = 7 THEN v_name := 'Óscar Iván Peñaloza Torres'; v_doc := '79123456'; v_email := 'oscar.penaloz@email.com'; v_phone := '3126789012';
    ELSIF i % 10 = 8 THEN v_name := 'Claudia Patricia Rojas Herrera'; v_doc := '52345678'; v_email := 'claudia.rojas@email.com'; v_phone := '3207890123';
    ELSE v_name := 'Nelson Alberto Gómez Álvarez'; v_doc := '79234567'; v_email := 'nelson.gomez@email.com'; v_phone := '3158901234';
    END IF;

    v_summary := 'Caso de ' || CASE v_type WHEN 'peticion' THEN 'petición' WHEN 'queja' THEN 'queja' WHEN 'reclamo' THEN 'reclamo' WHEN 'sugerencia' THEN 'sugerencia' WHEN 'denuncia_ddhh' THEN 'denuncia de DDHH' WHEN 'tutela' THEN 'tutela' END ||
      ' en tema de ' || (SELECT name FROM themes WHERE id = v_theme) || '. Ciudadano de ' || v_dept || ', ' || v_muni || '.';

    v_tags := ARRAY[
      (SELECT slug FROM themes WHERE id = v_theme),
      CASE v_type WHEN 'peticion' THEN 'peticion' WHEN 'queja' THEN 'queja' WHEN 'reclamo' THEN 'reclamo' WHEN 'sugerencia' THEN 'sugerencia' WHEN 'denuncia_ddhh' THEN 'denuncia' WHEN 'tutela' THEN 'tutela' END,
      LOWER(REPLACE(v_dept, ' ', '_'))
    ];

    v_channel := CASE (i % 5) WHEN 0 THEN 'web' WHEN 1 THEN 'whatsapp' WHEN 2 THEN 'presencial' WHEN 3 THEN 'telefonico' ELSE 'correo' END;
    v_sensitive := (v_type = 'denuncia_ddhh') OR (i IN (5,12,20,35,42));

    -- due_date: 15 días hábiles desde created (simplificado)
    v_due := (v_created::DATE + 21); -- ~3 semanas calendario

    -- Crear caso (trigger genera case_number)
    INSERT INTO cases (
      citizen_name, citizen_doc_type, citizen_doc,
      citizen_email, citizen_phone, citizen_dept, citizen_muni,
      citizen_consent, complaint_type, theme_id, subject_text,
      description, status, urgency, assigned_to, dependency_id,
      ai_summary, ai_tags, ai_processed, channel,
      due_date, created_by, created_at, is_sensitive
    ) VALUES (
      v_name, 'cc', v_doc,
      v_email, v_phone, v_dept, v_muni,
      true, v_type, v_theme, v_summary,
      v_desc, v_status, v_urg, v_assigned, v_dep,
      v_summary, v_tags, true, v_channel,
      v_due, v_admin, v_created, v_sensitive
    ) RETURNING id, case_number INTO v_case_id, v_cn;

    -- Mensajes
    INSERT INTO case_messages (case_id, author, message, is_system, created_at)
    VALUES (v_case_id, v_name, LEFT(v_desc, 200), false, v_created);

    IF v_status != 'recibida' THEN
      INSERT INTO case_messages (case_id, author, message, is_system, created_at)
      VALUES (v_case_id, 'Sistema', 'Estado cambiado de "recibida" a "' || v_status || '"', true, v_created + INTERVAL '2 hours');
    END IF;

    IF v_status = 'finalizada' THEN
      UPDATE cases SET resolved_at = v_created + (floor(random() * 10) + 3 || ' days')::INTERVAL WHERE id = v_case_id;
    END IF;

  END LOOP;

END $$;
