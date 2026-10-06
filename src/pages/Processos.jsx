import { useEffect, useState } from 'react'
import ProcessoCard from '../components/Processos/ProcessoCard'
import ProcessoForm from '../components/Processos/ProcessoForm'
import {
  criarProcesso,
  editarProcesso,
  excluirProcesso,
  listarProcessos,
} from '../services/processosService'

function Processos() {
  const [processos, setProcessos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingProcessId, setDeletingProcessId] = useState(null)
  const [editingProcessId, setEditingProcessId] = useState(null)
  const [updatingProcessId, setUpdatingProcessId] = useState(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true

    async function carregarProcessos() {
      try {
        const data = await listarProcessos()
        if (isActive) setProcessos(data)
      } catch (error) {
        if (isActive) {
          setLoadFailed(true)
          setErrorMessage(`Não foi possível carregar os processos: ${error.message}`)
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    carregarProcessos()
    return () => {
      isActive = false
    }
  }, [reloadKey])

  function handleRetry() {
    setErrorMessage('')
    setLoadFailed(false)
    setIsLoading(true)
    setReloadKey((currentKey) => currentKey + 1)
  }

  async function handleCreateProcesso(novoProcesso) {
    setIsSaving(true)
    setErrorMessage('')

    try {
      const processoCriado = await criarProcesso(novoProcesso)
      setProcessos((currentProcessos) => [processoCriado, ...currentProcessos])
      setLoadFailed(false)
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível salvar o processo: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteProcesso(processo) {
    if (updatingProcessId !== null || deletingProcessId !== null) return

    const confirmado = window.confirm(
      `Tem certeza de que deseja excluir o processo "${processo.nome}"?`,
    )

    if (!confirmado) return

    setDeletingProcessId(processo.id)
    setErrorMessage('')

    try {
      await excluirProcesso(processo.id)
      setProcessos((currentProcessos) =>
        currentProcessos.filter((item) => item.id !== processo.id),
      )
    } catch (error) {
      setErrorMessage(`Não foi possível excluir o processo: ${error.message}`)
    } finally {
      setDeletingProcessId(null)
    }
  }

  function handleEditProcesso(id) {
    if (id === null) {
      setEditingProcessId(null)
      return
    }

    if (updatingProcessId !== null || deletingProcessId !== null) return
    setEditingProcessId(id)
  }

  async function handleUpdateProcesso(id, changes) {
    setUpdatingProcessId(id)
    setErrorMessage('')

    try {
      const processoAtualizado = await editarProcesso(id, changes)
      setProcessos((currentProcessos) =>
        currentProcessos.map((processo) =>
          processo.id === id ? processoAtualizado : processo,
        ),
      )
      setEditingProcessId(null)
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível atualizar o processo: ${error.message}`)
      return false
    } finally {
      setUpdatingProcessId(null)
    }
  }

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Organize seus objetivos</p>
          <h1>Processos seletivos</h1>
          <p className="page-description">
            Acompanhe os concursos e seleções que fazem parte da sua jornada.
          </p>
        </div>
        <div className="process-count" aria-label={`${processos.length} processos cadastrados`}>
          <span>{processos.length}</span>
          <span>{processos.length === 1 ? 'processo cadastrado' : 'processos cadastrados'}</span>
        </div>
      </section>

      {errorMessage && (
        <div className="alert alert--error" role="alert">
          <span>{errorMessage}</span>
          <button
            className="alert-dismiss"
            type="button"
            aria-label="Fechar mensagem de erro"
            onClick={() => setErrorMessage('')}
          >
            ×
          </button>
        </div>
      )}

      <section className="content-grid" aria-label="Cadastro e lista de processos">
        <div className="panel form-panel">
          <div className="panel-heading">
            <span className="panel-icon" aria-hidden="true">+</span>
            <div>
              <h2>Novo processo</h2>
              <p>Adicione um objetivo à sua preparação.</p>
            </div>
          </div>
          <ProcessoForm
            onSubmit={handleCreateProcesso}
            isLoading={isLoading}
            isSaving={isSaving}
          />
        </div>

        <div className="process-list-section">
          <div className="section-heading">
            <div>
              <h2>Seus processos</h2>
              <p>Acompanhamento da sua preparação</p>
            </div>
          </div>

          {isLoading ? (
            <div className="list-message" role="status">Carregando processos...</div>
          ) : processos.length > 0 ? (
            <div className="process-list">
              {processos.map((processo) => (
                <ProcessoCard
                  key={processo.id}
                  processo={processo}
                  onDelete={handleDeleteProcesso}
                  onEdit={handleEditProcesso}
                  onUpdate={handleUpdateProcesso}
                  isEditing={editingProcessId === processo.id}
                  isDeleting={deletingProcessId === processo.id}
                  isUpdating={updatingProcessId === processo.id}
                  isBusy={deletingProcessId !== null || updatingProcessId !== null}
                />
              ))}
            </div>
          ) : loadFailed ? (
            <div className="list-message">
              <p>Não foi possível consultar a lista de processos.</p>
              <button className="button button--secondary" type="button" onClick={handleRetry}>
                Tentar novamente
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">◎</span>
              <h3>Nenhum processo cadastrado</h3>
              <p>Preencha o formulário para começar a organizar sua preparação.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Processos
