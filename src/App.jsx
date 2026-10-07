import { useEffect, useState } from 'react'
import AppLayout from './components/Layout/AppLayout'
import Login from './pages/Login'
import Processos from './pages/Processos'
import Simulados from './pages/Simulados'
import Mensagens from './pages/Mensagens'
import { supabase } from './services/supabase'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('processos')
  const [session, setSession] = useState(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let isActive = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isActive) {
        setSession(nextSession)
        setIsLoadingSession(false)
        setAuthError('')
      }
    })

    async function carregarSessao() {
      const { data, error } = await supabase.auth.getSession()
      if (!isActive) return

      if (error) {
        setAuthError(`Não foi possível verificar sua sessão: ${error.message}`)
      } else {
        setSession(data.session)
      }
      setIsLoadingSession(false)
    }

    carregarSessao()

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogin(email, password) {
    setAuthError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(`Não foi possível entrar: ${error.message}`)
      return false
    }

    setSession(data.session)
    return true
  }

  async function handleLogout() {
    setAuthError('')
    const { error } = await supabase.auth.signOut()
    if (error) {
      setAuthError(`Não foi possível encerrar a sessão: ${error.message}`)
    }
  }

  if (isLoadingSession) {
    return (
      <div className="auth-loading" role="status">
        <span className="brand-mark" aria-hidden="true">A</span>
        <span>Preparando seu espaço de estudos...</span>
      </div>
    )
  }

  if (!session) {
    return (
      <Login
        onSubmit={handleLogin}
        errorMessage={authError}
        onDismissError={() => setAuthError('')}
      />
    )
  }

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={setActivePage}
      userEmail={session.user.email}
      onLogout={handleLogout}
      errorMessage={authError}
      onDismissError={() => setAuthError('')}
    >
      {activePage === 'processos' && <Processos />}
      {activePage === 'simulados' && <Simulados />}
      {activePage === 'mensagens' && <Mensagens />}
    </AppLayout>
  )
}

export default App
