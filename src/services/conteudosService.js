import { supabase } from './supabase'
import { requireAuthenticatedUser } from './authService'

const conteudoColumns =
  'id, disciplina_id, nome, descricao, nivel_conhecimento, created_at, updated_at'

export async function listarConteudos(disciplinaId) {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('conteudo')
    .select(conteudoColumns)
    .eq('disciplina_id', disciplinaId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function criarConteudo(conteudo) {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('conteudo')
    .insert([{
      disciplina_id: conteudo.disciplina_id,
      nome: conteudo.nome,
      descricao: conteudo.descricao,
      nivel_conhecimento: conteudo.nivel_conhecimento,
    }])
    .select(conteudoColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function editarConteudo(id, changes) {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('conteudo')
    .update({
      nome: changes.nome,
      descricao: changes.descricao,
      nivel_conhecimento: changes.nivel_conhecimento,
    })
    .eq('id', id)
    .select(conteudoColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function excluirConteudo(id) {
  await requireAuthenticatedUser()
  const { error } = await supabase
    .from('conteudo')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
