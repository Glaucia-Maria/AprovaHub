import { useEffect, useState } from 'react'
import MensagemForm from '../components/Mensagens/MensagemForm'
import {
  criarMensagem,
  editarMensagem,
  excluirMensagem,
  listarMensagens,
} from '../services/mensagensService'

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(data))
}

function Mensagens() {
  const [mensagens, setMensagens] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    async function carregarMensagens() {
      setIsLoading(true)
      setLoadFailed(false)
      try {
        const rows = await listarMensagens()
        if (isActive) setMensagens(rows)
      } catch (error) {
        if (isActive) {
          setLoadFailed(true)
          setErrorMessage(`Não foi possível carregar suas mensagens: ${error.message}`)
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    carregarMensagens()
    return () => {
      isActive = false
    }
  }, [reloadKey])

  async function handleCreate(values) {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const created = await criarMensagem(values)
      setMensagens((current) => [created, ...current])
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível guardar a mensagem: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdate(id, values) {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const updated = await editarMensagem(id, values)
      setMensagens((current) => current.map((item) => item.id === id ? updated : item))
      setEditingId(null)
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível atualizar a mensagem: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(mensagem) {
    if (!window.confirm('Excluir este recadinho?')) return
    setErrorMessage('')
    try {
      await excluirMensagem(mensagem.id)
      setMensagens((current) => current.filter((item) => item.id !== mensagem.id))
    } catch (error) {
      setErrorMessage(`Não foi possível excluir a mensagem: ${error.message}`)
    }
  }

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Um espaço só seu</p>
          <h1>Meu diário de estudos</h1>
          <p className="page-description">
            Guarde pequenas vitórias, ideias e palavras gentis para os dias puxados.
          </p>
        </div>
        <div className="process-count">
          <span>{mensagens.length}</span>
          <span>{mensagens.length === 1 ? 'recadinho guardado' : 'recadinhos guardados'}</span>
        </div>
      </section>

      {errorMessage && (
        <div className="alert alert--error" role="alert">
          <span>{errorMessage}</span>
          <button className="alert-dismiss" type="button" aria-label="Fechar mensagem de erro" onClick={() => setErrorMessage('')}>×</button>
        </div>
      )}

      <section className="content-grid" aria-label="Escrever e consultar mensagens pessoais">
        <div className="panel record-form-panel diary-form-panel">
          <div className="panel-heading">
            <span className="panel-icon" aria-hidden="true">♡</span>
            <div>
              <h2>Deixe um recadinho</h2>
              <p>Para você de hoje — ou para você de amanhã.</p>
            </div>
          </div>
          <MensagemForm onSubmit={handleCreate} isSaving={isSaving} />
        </div>

        <div className="record-list-section">
          <div className="section-heading">
            <div>
              <h2>Seus lembretes</h2>
              <p>Palavras suas, no seu tempo</p>
            </div>
          </div>
          {isLoading ? (
            <div className="list-message" role="status">Carregando suas mensagens...</div>
          ) : loadFailed ? (
            <div className="list-message">
              <p>Não foi possível consultar suas mensagens.</p>
              <button className="button button--secondary" type="button" onClick={() => setReloadKey((key) => key + 1)}>
                Tentar novamente
              </button>
            </div>
          ) : mensagens.length ? (
            <div className="record-list">
              {mensagens.map((mensagem) => (
                <article className="record-card diary-card" key={mensagem.id}>
                  {editingId === mensagem.id ? (
                    <>
                      <h3 className="nested-edit-title">Editar recadinho</h3>
                      <MensagemForm
                        fieldPrefix={`mensagem-${mensagem.id}`}
                        initialValues={mensagem}
                        onSubmit={(values) => handleUpdate(mensagem.id, values)}
                        onCancel={() => setEditingId(null)}
                        isSaving={isSaving}
                      />
                    </>
                  ) : (
                    <>
                      <p className="record-date">💌 {formatarData(mensagem.created_at)}</p>
                      <p className="diary-message">{mensagem.mensagem}</p>
                      <div className="record-actions">
                        <button className="button button--update" type="button" onClick={() => setEditingId(mensagem.id)} disabled={isSaving}>Editar</button>
                        <button className="button button--delete" type="button" onClick={() => handleDelete(mensagem)} disabled={isSaving}>Excluir</button>
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">💌</span>
              <h3>Um cantinho esperando por você</h3>
              <p>Escreva uma mensagem para celebrar seu esforço ou deixar um lembrete para outro dia.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Mensagens
