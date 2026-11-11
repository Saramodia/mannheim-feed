import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Feed } from './components/Feed'
import { Login } from './components/Login'
import { ProfileView } from './components/ProfileView'
import { loadArticles, loadProfile, saveProfile } from './lib/data'
import { isDemo, supabase } from './lib/supabase'
import { EMPTY_PROFILE, type Article, type Profile } from './lib/types'

type Tab = 'feed' | 'profile'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(isDemo)
  const [tab, setTab] = useState<Tab>('feed')
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const saveTimer = useRef<number | undefined>(undefined)
  const userId = session?.user.id

  // 1. ¿Hay alguien conectado? (solo con Supabase)
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthReady(true) })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  // 2. Cargar noticias
  const fetchArticles = useCallback(() => {
    setLoading(true)
    setError(null)
    loadArticles()
      .then(setArticles)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // 3. Cargar el perfil
  useEffect(() => {
    if (!authReady || (!isDemo && !userId)) return
    fetchArticles()
    loadProfile(userId).then(setProfile)
  }, [authReady, userId, fetchArticles])

  // 4. Guardar el perfil automáticamente, medio segundo después del último cambio
  const updateProfile = (p: Profile) => {
    setProfile(p)
    setSaveState('saving')
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      saveProfile(p, userId).then(() => setSaveState('saved')).catch(() => setSaveState('error'))
    }, 500)
  }

  if (!authReady) return null
  if (!isDemo && !session) return <Login />

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width="28" height="28" />
          <span>Mannheim Feed</span>
        </div>
        {isDemo && <span className="demo-badge" title="Sin base de datos: noticias de prueba y perfil solo en este navegador">Modo prueba</span>}
      </header>

      <main className="content">
        {tab === 'feed' ? (
          <Feed articles={articles} profile={profile} loading={loading} error={error}
            onRetry={fetchArticles} onOpenProfile={() => setTab('profile')} />
        ) : (
          <ProfileView profile={profile} onChange={updateProfile} articles={articles} saveState={saveState}
            email={session?.user.email} onSignOut={supabase ? () => supabase!.auth.signOut() : undefined} />
        )}
      </main>

      <nav className="tabbar" aria-label="Secciones">
        <button aria-current={tab === 'feed' ? 'page' : undefined} onClick={() => setTab('feed')}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h10" /></svg>
          Noticias
        </button>
        <button aria-current={tab === 'profile' ? 'page' : undefined} onClick={() => setTab('profile')}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
          Perfil
        </button>
      </nav>
    </div>
  )
}
