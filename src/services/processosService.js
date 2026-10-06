import { supabase } from './supabase'

const processColumns = 'id, nome, descricao, status, created_at, updated_at'

export async function listarProcessos() {
  const { data, error } = await supabase
    .from('processo_seletivo')
    .select(processColumns)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function criarProcesso(processo) {
  const { data, error } = await supabase
    .from('processo_seletivo')
    .insert([
      {nome: processo.nome, descricao: processo.descricao, status: processo.status},
    ])
    .select(processColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function excluirProcesso(id) {
  const { error } = await supabase
    .from('processo_seletivo')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function editarProcesso(id, processo) {
  const { data, error } = await supabase
    .from('processo_seletivo')
    .update({
      nome: processo.nome,
      descricao: processo.descricao,
      status: processo.status,
    })
    .eq('id', id)
    .select(processColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
