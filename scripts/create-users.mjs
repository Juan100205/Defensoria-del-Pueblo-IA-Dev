/**
 * Crea usuarios de prueba — bypass del trigger roto
 * Ejecutar: node scripts/create-users.mjs
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hcvcsuictkltchdvvdix.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdmNzdWljdGtsdGNoZHZ2ZGl4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzI1MTE2MSwiZXhwIjoyMTAyODI3MTYxfQ.bGaRYT1ir3un4itdoyiKDnI8oU49w7vSkmeNGF4R2Wo'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const USERS = [
  { email: 'admin@defensoria.gov.co', password: 'Defensoria2026!', full_name: 'Administrador General', role: 'administrador' },
  { email: 'coordinador@defensoria.gov.co', password: 'Defensoria2026!', full_name: 'María García López', role: 'coordinador' },
  { email: 'analista@defensoria.gov.co', password: 'Defensoria2026!', full_name: 'Carlos Pérez Martínez', role: 'analista' },
  { email: 'consulta@defensoria.gov.co', password: 'Defensoria2026!', full_name: 'Ana López Rodríguez', role: 'consulta' },
]

// Disable/enable trigger via REST
async function sqlExec(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ query }),
  })
  return res.ok
}

async function main() {
  // Step 1: Disable trigger via PostgREST (using raw SQL endpoint)
  console.log('1. Deshabilitando trigger...')
  try {
    // Use Supabase's SQL endpoint
    const trigRes = await fetch(`${SUPABASE_URL}/pg/postgrest/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: "ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created" }),
    })
    console.log(`   Trigger disable: ${trigRes.status}`)
  } catch {
    console.log('   No se pudo deshabilitar trigger via API, intentando directamente...')
  }

  // Step 2: Create users
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingMap = {}
  for (const u of (existingUsers?.users || [])) {
    existingMap[u.email] = u
  }
  console.log(`\n   Usuarios existentes: ${Object.keys(existingMap).join(', ') || 'ninguno'}`)

  for (const u of USERS) {
    console.log(`\n2. ${u.email} (${u.role})...`)

    let userId

    if (existingMap[u.email]) {
      userId = existingMap[u.email].id
      console.log(`   Auth ya existe: ${userId}`)
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      })

      if (error) {
        console.error(`   Error auth: ${error.message}`)
        // Check if user was partially created
        const { data: retry } = await supabase.auth.admin.listUsers()
        const r = retry?.users?.find((x) => x.email === u.email)
        if (r) {
          userId = r.id
          console.log(`   Recuperado: ${userId}`)
        } else {
          continue
        }
      } else {
        userId = data.user.id
        console.log(`   Auth creado: ${userId}`)
      }
    }

    // Upsert profile
    const { error: pe } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      is_active: true,
    }, { onConflict: 'id' })
    if (pe) console.error(`   Profile error: ${pe.message}`)
    else console.log(`   Profile OK: ${u.role}`)
  }

  // Step 3: Re-enable trigger
  console.log('\n3. Rehabilitando trigger...')
  try {
    await fetch(`${SUPABASE_URL}/pg/postgrest/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: "ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created" }),
    })
  } catch {}

  console.log('\n\n=== CREDENCIALES ===')
  USERS.forEach(u => console.log(`  ${u.email} / ${u.password} (${u.role})`))
}

main().catch(console.error)
