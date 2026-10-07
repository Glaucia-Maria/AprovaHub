import { supabase } from './supabase'

export async function requireAuthenticatedUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw new Error(`É necessário estar autenticado para acessar os dados: ${error.message}`)
  }

  if (!data.user) {
    throw new Error('É necessário estar autenticado para acessar os dados.')
  }

  return data.user
}
