import { supabase } from './supabase'

const simuladoColumns =
  'id, processo_seletivo_id, nome, data, quantidade_questoes, quantidade_acertos, observacao, created_at, updated_at'

export async function listarSimulados() {
  const { data, error } = await supabase
    .from('simulado')
    .select(simuladoColumns)
    .order('data', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function criarSimulado(simulado) {
  const { data, error } = await supabase
    .from('simulado')
    .insert([{
      processo_seletivo_id: simulado.processo_seletivo_id,
      nome: simulado.nome,
      data: simulado.data,
      quantidade_questoes: simulado.quantidade_questoes,
      quantidade_acertos: simulado.quantidade_acertos,
      observacao: simulado.observacao,
    }])
    .select(simuladoColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function editarSimulado(id, simulado) {
  const { data, error } = await supabase
    .from('simulado')
    .update({
      processo_seletivo_id: simulado.processo_seletivo_id,
      nome: simulado.nome,
      data: simulado.data,
      quantidade_questoes: simulado.quantidade_questoes,
      quantidade_acertos: simulado.quantidade_acertos,
      observacao: simulado.observacao,
    })
    .eq('id', id)
    .select(simuladoColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function excluirSimulado(id) {
  const { error } = await supabase
    .from('simulado')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
