import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { supabase } from '../services/supabase'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (isActive) {
        setSession(nextSession)
        setIsLoading(false)
        setErrorMessage('')
      }
    })

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession()
      if (!isActive) return

      if (error) {
        setErrorMessage(`Não foi possível verificar sua sessão: ${error.message}`)
      } else {
        setSession(data.session)
      }
      setIsLoading(false)
    }

    loadSession()

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email, password) => {
    setErrorMessage('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setErrorMessage(`Não foi possível entrar: ${error.message}`)
      return false
    }

    setSession(data.session)
    return true
  }, [])

  const signOut = useCallback(async () => {
    setErrorMessage('')
    const { error } = await supabase.auth.signOut()
    if (error) {
      setErrorMessage(`Não foi possível encerrar a sessão: ${error.message}`)
      return false
    }

    setSession(null)
    return true
  }, [])

  const clearError = useCallback(() => setErrorMessage(''), [])

  const value = useMemo(() => ({
    session,
    user: session?.user ?? null,
    isLoading,
    errorMessage,
    signIn,
    signOut,
    clearError,
  }), [session, isLoading, errorMessage, signIn, signOut, clearError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
