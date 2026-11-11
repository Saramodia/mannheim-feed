import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Inicio de sesión sin contraseña: escribes tu email y te llega un código para entrar.
// Usamos un código (y no solo un enlace) porque en el móvil la app instalada no comparte
// la sesión con el navegador: el enlace abriría Safari/Chrome y la app seguiría sin sesión.
export function Login() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'verifying'>('idle')
  const [error, setError] = useState('')

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setError('')
    setState('sending')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL }
    })
    if (error) { setError(`No se pudo enviar el email: ${error.message}`); setState('idle') } else setState('sent')
  }

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setError('')
    setState('verifying')
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'email' })
    if (error) {
      setError('El código no es correcto o ha caducado. Revisa el último email o pide uno nuevo.')
      setState('sent')
    }
    // Si funciona, la app detecta la sesión sola y muestra tus noticias.
  }

  return (
    <main className="login">
      <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="64" height="64" />
      <h1>Mannheim Feed</h1>

      {state === 'idle' || state === 'sending' ? (
        <form onSubmit={send} className="login-form">
          <label htmlFor="email">Tu email</label>
          <input id="email" type="email" className="input" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-primary" disabled={state === 'sending'}>
            {state === 'sending' ? 'Enviando…' : 'Enviarme un código'}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="login-form">
          <p>Te hemos enviado un código a <strong>{email}</strong>. Escríbelo aquí.</p>
          <label htmlFor="code">Código del email</label>
          <input id="code" className="input" required inputMode="numeric" autoComplete="one-time-code"
            pattern="[0-9]{6,10}" maxLength={10} value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
          <button className="btn btn-primary" disabled={state === 'verifying' || code.length < 6}>
            {state === 'verifying' ? 'Comprobando…' : 'Entrar'}
          </button>
          <button type="button" className="link-btn" onClick={() => { setCode(''); setError(''); setState('idle') }}>
            Usar otro email o pedir un código nuevo
          </button>
        </form>
      )}

      {error && <p className="error" role="alert">{error}</p>}
    </main>
  )
}
