import { useState } from 'react'
import AppLayout from './components/Layout/AppLayout'
import { useAuth } from './contexts/useAuth'
import Login from './pages/Login'
import Processos from './pages/Processos'
import Simulados from './pages/Simulados'
import Mensagens from './pages/Mensagens'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('processos')
  const {
    user,
    session,
    isLoading,
    errorMessage,
    signIn,
    signOut,
    clearError,
  } = useAuth()

  if (isLoading) {
    return (
      <div className="auth-loading" role="status">
        <span className="brand-mark" aria-hidden="true">A</span>
        <span>Preparando seu espaço de estudos...</span>
      </div>
    )
  }

  if (!user || !session) {
    return (
      <Login
        onSubmit={signIn}
        errorMessage={errorMessage}
        onDismissError={clearError}
      />
    )
  }

  return (
    <AppLayout
      activePage={activePage}
      onNavigate={setActivePage}
      userEmail={user.email}
      onLogout={signOut}
      errorMessage={errorMessage}
      onDismissError={clearError}
    >
      {activePage === 'processos' && <Processos />}
      {activePage === 'simulados' && <Simulados />}
      {activePage === 'mensagens' && <Mensagens />}
    </AppLayout>
  )
}

export default App
