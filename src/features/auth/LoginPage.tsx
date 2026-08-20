import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export function LoginPage({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const { signIn, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && onLoginSuccess) onLoginSuccess()
  }, [user, onLoginSuccess])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn(email, password)
    if (result.error) {
      setError(
        result.error.includes('Invalid login')
          ? 'Correo o contraseña incorrectos.'
          : 'Error al iniciar sesión. Intente nuevamente.'
      )
    }
    setLoading(false)
  }

  return (
    <div className="scene on" id="sc-login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--navy-050)' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
              Defensoría del Pueblo
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 4 }}>
              Sistema de Gestión de Solicitudes
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="lbl">Correo electrónico</label>
            <input
              className="field"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="funcionario@defensoria.gov.co"
              required
              autoFocus
            />

            <label className="lbl" style={{ marginTop: 16 }}>Contraseña</label>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {error && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--red-050)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              className="btn btn-primary btn-block"
              type="submit"
              disabled={loading}
              style={{ marginTop: 20 }}
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--ink-3)' }}>
          Ciudadanos: accedan al chat de radicación desde la página principal.
        </div>
      </div>
    </div>
  )
}
