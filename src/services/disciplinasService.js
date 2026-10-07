import { supabase } from './supabase'

const disciplinaColumns = 'id, processo_seletivo_id, nome, peso, created_at, updated_at'

export async function listarDisciplinas(processoId) {
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
  const { error } = await supabase
    .from('disciplina')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
