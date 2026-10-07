import { useEffect, useMemo, useState } from 'react'
import SimuladoForm from '../components/Simulados/SimuladoForm'
import { listarProcessos } from '../services/processosService'
import {
  criarSimulado,
  editarSimulado,
  excluirSimulado,
  listarSimulados,
} from '../services/simuladosService'

function formatarData(data) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })
    .format(new Date(`${data}T00:00:00`))
}

function Simulados() {
  const [processos, setProcessos] = useState([])
  const [simulados, setSimulados] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const processNames = useMemo(
    () => new Map(processos.map((processo) => [String(processo.id), processo.nome])),
    [processos],
  )

  useEffect(() => {
    let isActive = true

    async function carregarDados() {
      setIsLoading(true)
      setLoadFailed(false)
      try {
        const [processRows, simuladoRows] = await Promise.all([
          listarProcessos(),
          listarSimulados(),
        ])
        if (isActive) {
          setProcessos(processRows)
          setSimulados(simuladoRows)
        }
      } catch (error) {
        if (isActive) {
          setLoadFailed(true)
          setErrorMessage(`Não foi possível carregar os simulados: ${error.message}`)
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    carregarDados()
    return () => {
      isActive = false
    }
  }, [reloadKey])

  async function handleCreate(values) {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const created = await criarSimulado(values)
      setSimulados((current) => [created, ...current])
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível salvar o simulado: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdate(id, values) {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const updated = await editarSimulado(id, values)
      setSimulados((current) => current.map((item) => item.id === id ? updated : item))
      setEditingId(null)
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível atualizar o simulado: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(simulado) {
    if (!window.confirm(`Excluir o simulado "${simulado.nome}"?`)) return
    setErrorMessage('')
    try {
      await excluirSimulado(simulado.id)
      setSimulados((current) => current.filter((item) => item.id !== simulado.id))
    } catch (error) {
      setErrorMessage(`Não foi possível excluir o simulado: ${error.message}`)
    }
  }

  return (
    <>
      <section className="page-intro">
        <div>
          <p className="eyebrow">Cada questão conta</p>
          <h1>Histórico de simulados</h1>
          <p className="page-description">
            Registre seus resultados, celebre os acertos e transforme erros em próximos passos.
          </p>
        </div>
        <div className="process-count">
          <span>{simulados.length}</span>
          <span>{simulados.length === 1 ? 'simulado registrado' : 'simulados registrados'}</span>
        </div>
      </section>

      {errorMessage && (
        <div className="alert alert--error" role="alert">
          <span>{errorMessage}</span>
          <button className="alert-dismiss" type="button" aria-label="Fechar mensagem de erro" onClick={() => setErrorMessage('')}>×</button>
        </div>
      )}

      <section className="content-grid" aria-label="Cadastro e histórico de simulados">
        <div className="panel record-form-panel">
          <div className="panel-heading">
            <span className="panel-icon" aria-hidden="true">✎</span>
            <div>
              <h2>Novo simulado</h2>
              <p>Salve o resultado e o que aprendeu com ele.</p>
            </div>
          </div>
          {processos.length === 0 && !isLoading && (
            <p className="inline-hint">Cadastre um processo seletivo antes de adicionar simulados.</p>
          )}
          <SimuladoForm processos={processos} onSubmit={handleCreate} isSaving={isSaving} />
        </div>

        <div className="record-list-section">
          <div className="section-heading">
            <div>
              <h2>Seus resultados</h2>
              <p>Uma linha do tempo da sua evolução</p>
            </div>
          </div>
          {isLoading ? (
            <div className="list-message" role="status">Carregando simulados...</div>
          ) : loadFailed ? (
            <div className="list-message">
              <p>Não foi possível consultar seu histórico.</p>
              <button className="button button--secondary" type="button" onClick={() => setReloadKey((key) => key + 1)}>
                Tentar novamente
              </button>
            </div>
          ) : simulados.length ? (
            <div className="record-list">
              {simulados.map((simulado) => {
                const percentual = Math.round(
                  (Number(simulado.quantidade_acertos) / Number(simulado.quantidade_questoes)) * 100,
                )
                return (
                  <article className="record-card" key={simulado.id}>
                    {editingId === simulado.id ? (
                      <>
                        <h3 className="nested-edit-title">Editar simulado</h3>
                        <SimuladoForm
                          fieldPrefix={`simulado-${simulado.id}`}
                          processos={processos}
                          initialValues={simulado}
                          onSubmit={(values) => handleUpdate(simulado.id, values)}
                          onCancel={() => setEditingId(null)}
                          isSaving={isSaving}
                        />
                      </>
                    ) : (
                      <>
                        <div className="record-card-heading">
                          <div>
                            <p className="record-date">{formatarData(simulado.data)}</p>
                            <h3>{simulado.nome}</h3>
                            <p className="record-process">
                              {processNames.get(String(simulado.processo_seletivo_id)) ?? 'Processo seletivo'}
                            </p>
                          </div>
                          <div className="score-sticker" aria-label={`${percentual}% de acertos`}>
                            <strong>{percentual}%</strong>
                            <span>de acertos</span>
                          </div>
                        </div>
                        <div className="score-track" aria-label={`${simulado.quantidade_acertos} acertos de ${simulado.quantidade_questoes}`}>
                          <span style={{ width: `${percentual}%` }} />
                        </div>
                        <p className="score-count">
                          {simulado.quantidade_acertos} de {simulado.quantidade_questoes} questões
                        </p>
                        {simulado.observacao && (
                          <blockquote className="record-note">{simulado.observacao}</blockquote>
                        )}
                        <div className="record-actions">
                          <button className="button button--update" type="button" onClick={() => setEditingId(simulado.id)} disabled={isSaving}>Editar</button>
                          <button className="button button--delete" type="button" onClick={() => handleDelete(simulado)} disabled={isSaving}>Excluir</button>
                        </div>
                      </>
                    )}
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">📝</span>
              <h3>Seu próximo resultado começa aqui</h3>
              <p>Registre um simulado para acompanhar seu progresso e guardar suas percepções.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Simulados
