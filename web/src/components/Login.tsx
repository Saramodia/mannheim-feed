import { useState } from 'react'
import { supabase } from '../lib/supabase'

// Inicio de sesión sin contraseña: escribes tu email y te llega un enlace para entrar.
export function Login() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setState('sending')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL }
    })
    if (error) { setError(error.message); setState('error') } else setState('sent')
  }

  return (
    <main className="login">
      <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="64" height="64" />
      <h1>Mannheim Feed</h1>
      {state === 'sent' ? (
        <p>Te hemos enviado un enlace a <strong>{email}</strong>. Ábrelo en este dispositivo para entrar.</p>
      ) : (
        <form onSubmit={send} className="login-form">
          <label htmlFor="email">Tu email</label>
          <input id="email" type="email" className="input" required autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn btn-primary" disabled={state === 'sending'}>
            {state === 'sending' ? 'Enviando…' : 'Enviarme un enlace de acceso'}
          </button>
          {state === 'error' && <p className="error">No se pudo enviar el enlace: {error}</p>}
        </form>
      )}
    </main>
  )
}
