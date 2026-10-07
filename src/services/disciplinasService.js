import { supabase } from './supabase'
import { requireAuthenticatedUser } from './authService'

const disciplinaColumns = 'id, processo_seletivo_id, nome, peso, created_at, updated_at'

export async function listarDisciplinas(processoId) {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('disciplina')
    .select(disciplinaColumns)
    .eq('processo_seletivo_id', processoId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function criarDisciplina(disciplina) {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('disciplina')
    .insert([{
      processo_seletivo_id: disciplina.processo_seletivo_id,
      nome: disciplina.nome,
      peso: disciplina.peso,
    }])
    .select(disciplinaColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function editarDisciplina(id, changes) {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('disciplina')
    .update({ nome: changes.nome, peso: changes.peso })
    .eq('id', id)
    .select(disciplinaColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function excluirDisciplina(id) {
  await requireAuthenticatedUser()
  const { error } = await supabase
    .from('disciplina')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
