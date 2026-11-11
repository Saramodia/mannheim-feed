import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Inicio de sesión con email y contraseña.
// Usamos contraseña (y no un enlace o código por email) porque en el móvil la app instalada
// no comparte la sesión con el navegador, y el plan gratuito de Supabase no deja cambiar
// el email para incluir un código. Con contraseña, entras directamente dentro de la app.
export function Login() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setError('')
    setNotice('')
    setBusy(true)
    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message.includes('not confirmed')
          ? 'Antes de entrar, confirma tu cuenta con el enlace que te enviamos por email.'
          : 'El email o la contraseña no son correctos.')
      }
      // Si funciona, la app detecta la sesión sola y muestra tus noticias.
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL }
      })
      if (error) setError(`No se pudo crear la cuenta: ${error.message}`)
      else if (!data.session) {
        setNotice('Te hemos enviado un email para confirmar tu cuenta. Pulsa el enlace (se abrirá en el navegador, es normal), vuelve aquí y entra con tu contraseña.')
        setMode('signin')
      }
    }
    setBusy(false)
  }

  const switchMode = () => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setNotice('') }

  return (
    <main className="login">
      <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="64" height="64" />
      <h1>Mannheim Feed</h1>

      <form onSubmit={submit} className="login-form">
        <label htmlFor="email">Email</label>
        <input id="email" type="email" className="input" required autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" className="input" required minLength={6}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          value={password} onChange={(e) => setPassword(e.target.value)} />
        {mode === 'signup' && <p className="hint">Mínimo 6 caracteres.</p>}

        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Un momento…' : mode === 'signin' ? 'Entrar' : 'Crear mi cuenta'}
        </button>
        <button type="button" className="link-btn" onClick={switchMode}>
          {mode === 'signin' ? 'Es mi primera vez: crear cuenta' : 'Ya tengo cuenta: entrar'}
        </button>
      </form>

      {notice && <p role="status">{notice}</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </main>
  )
}
