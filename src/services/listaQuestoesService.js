import { requireAuthenticatedUser } from './authService'
import { supabase } from './supabase'

const questaoColumns =
  'id, conteudo_id, quantidade_questoes, quantidade_acertos, created_at, updated_at'

export async function listarListaQuestoes(conteudoId) {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('lista_questoes')
    .select(questaoColumns)
    .eq('conteudo_id', conteudoId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function criarListaQuestoes(registro) {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('lista_questoes')
    .insert([{
      conteudo_id: registro.conteudo_id,
      quantidade_questoes: registro.quantidade_questoes,
      quantidade_acertos: registro.quantidade_acertos,
    }])
    .select(questaoColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function editarListaQuestoes(id, registro) {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('lista_questoes')
    .update({
      quantidade_questoes: registro.quantidade_questoes,
      quantidade_acertos: registro.quantidade_acertos,
    })
    .eq('id', id)
    .select(questaoColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function excluirListaQuestoes(id) {
  await requireAuthenticatedUser()
  const { error } = await supabase
    .from('lista_questoes')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
