-- ============================================================
-- 007_fix_auth_users.sql
-- Reparar auth.users corrupto por insercion directa en 006
-- ============================================================

-- Primero, eliminar el trigger temporalmente para poder limpiar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminar los usuarios rotos de auth.users
DELETE FROM auth.users WHERE email IN (
  'admin@defensoria.gov.co',
  'coordinador@defensoria.gov.co',
  'analista@defensoria.gov.co',
  'consulta@defensoria.gov.co'
);

-- Restaurar el trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Limpiar profiles huérfanos
DELETE FROM profiles WHERE email IN (
  'admin@defensoria.gov.co',
  'coordinador@defensoria.gov.co',
  'analista@defensoria.gov.co',
  'consulta@defensoria.gov.co'
);
