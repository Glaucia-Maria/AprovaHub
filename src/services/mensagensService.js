import { supabase } from './supabase'
import { requireAuthenticatedUser } from './authService'

const mensagemColumns = 'id, conteudo, created_at'

function mapearMensagem(row) {
  return { ...row, mensagem: row.conteudo }
}

export async function listarMensagens() {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('mensagem')
    .select(mensagemColumns)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data.map(mapearMensagem)
}

export async function criarMensagem(mensagem) {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('mensagem')
    .insert([{ conteudo: mensagem.mensagem }])
    .select(mensagemColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapearMensagem(data)
}

export async function editarMensagem(id, mensagem) {
  await requireAuthenticatedUser()
  const { data, error } = await supabase
    .from('mensagem')
    .update({ conteudo: mensagem.mensagem })
    .eq('id', id)
    .select(mensagemColumns)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return mapearMensagem(data)
}

export async function excluirMensagem(id) {
  await requireAuthenticatedUser()
  const { error } = await supabase
    .from('mensagem')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }
}
