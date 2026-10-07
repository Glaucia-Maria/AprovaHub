import { useEffect, useMemo, useState } from 'react'
import DisciplinaForm from '../components/Disciplinas/DisciplinaForm'
import ConteudoForm from '../components/Disciplinas/ConteudoForm'
import ListaQuestoesForm from '../components/Disciplinas/ListaQuestoesForm'
import { obterDominio } from '../components/Disciplinas/dominioNiveis'
import {
  criarDisciplina,
  editarDisciplina,
  excluirDisciplina,
  listarDisciplinas,
} from '../services/disciplinasService'
import {
  criarConteudo,
  editarConteudo,
  excluirConteudo,
  listarConteudos,
} from '../services/conteudosService'
import {
  criarListaQuestoes,
  editarListaQuestoes,
  excluirListaQuestoes,
  listarListaQuestoes,
} from '../services/listaQuestoesService'

function atualizarConteudo(disciplinas, conteudoId, atualizar) {
  return disciplinas.map((disciplina) => ({
    ...disciplina,
    conteudos: disciplina.conteudos.map((conteudo) =>
      conteudo.id === conteudoId ? atualizar(conteudo) : conteudo,
    ),
  }))
}

function calcularAproveitamento(registros) {
  const totalQuestoes = registros.reduce(
    (total, registro) => total + Number(registro.quantidade_questoes),
    0,
  )
  const totalAcertos = registros.reduce(
    (total, registro) => total + Number(registro.quantidade_acertos),
    0,
  )

  return {
    totalQuestoes,
    totalAcertos,
    percentual: totalQuestoes ? (totalAcertos / totalQuestoes) * 100 : null,
  }
}

function calcularDominio(conteudos) {
  if (!conteudos.length) return null
  const media = conteudos.reduce(
    (total, conteudo) => total + Number(conteudo.nivel_conhecimento),
    0,
  ) / conteudos.length
  return (media / 5) * 100
}

function formatarDominio(valor) {
  return `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%`
}

function ProcessoDetalhe({ processo, onBack }) {
  const [disciplinas, setDisciplinas] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [editingDisciplinaId, setEditingDisciplinaId] = useState(null)
  const [editingConteudoId, setEditingConteudoId] = useState(null)
  const [editingListaQuestoesId, setEditingListaQuestoesId] = useState(null)
  const [expandedDisciplinaId, setExpandedDisciplinaId] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isActive = true

    async function carregarDisciplinas() {
      setIsLoading(true)
      setLoadFailed(false)
      try {
        const rows = await listarDisciplinas(processo.id)
        const disciplinasComConteudos = await Promise.all(
          rows.map(async (disciplina) => {
            const conteudos = await listarConteudos(disciplina.id)
            const conteudosComQuestoes = await Promise.all(
              conteudos.map(async (conteudo) => ({
                ...conteudo,
                listaQuestoes: await listarListaQuestoes(conteudo.id),
              })),
            )
            return { ...disciplina, conteudos: conteudosComQuestoes }
          }),
        )
        if (isActive) setDisciplinas(disciplinasComConteudos)
      } catch (error) {
        if (isActive) {
          setLoadFailed(true)
          setErrorMessage(`Não foi possível carregar as disciplinas e conteúdos: ${error.message}`)
        }
      } finally {
        if (isActive) setIsLoading(false)
      }
    }

    carregarDisciplinas()
    return () => {
      isActive = false
    }
  }, [processo.id, reloadKey])

  const progresso = useMemo(() => {
    const disciplinasComDominio = disciplinas
      .map((disciplina) => ({
        peso: Number(disciplina.peso) || 1,
        dominio: calcularDominio(disciplina.conteudos),
      }))
      .filter((disciplina) => disciplina.dominio !== null)

    if (!disciplinasComDominio.length) return null
    const somaPesos = disciplinasComDominio.reduce((total, disciplina) => total + disciplina.peso, 0)
    const dominioPonderado = disciplinasComDominio.reduce(
      (total, disciplina) => total + disciplina.dominio * disciplina.peso,
      0,
    ) / somaPesos
    return dominioPonderado
  }, [disciplinas])

  function handleRetry() {
    setErrorMessage('')
    setReloadKey((currentKey) => currentKey + 1)
  }

  async function handleCreateDisciplina(values) {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const disciplina = await criarDisciplina({
        ...values,
        processo_seletivo_id: processo.id,
      })
      setDisciplinas((current) => [...current, { ...disciplina, conteudos: [] }])
      setExpandedDisciplinaId(disciplina.id)
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível salvar a disciplina: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateDisciplina(id, values) {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const disciplinaAtualizada = await editarDisciplina(id, values)
      setDisciplinas((current) =>
        current.map((disciplina) =>
          disciplina.id === id ? { ...disciplina, ...disciplinaAtualizada } : disciplina,
        ),
      )
      setEditingDisciplinaId(null)
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível atualizar a disciplina: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteDisciplina(disciplina) {
    const confirmado = window.confirm(
      `Tem certeza de que deseja excluir a disciplina "${disciplina.nome}"?`,
    )
    if (!confirmado) return

    setErrorMessage('')
    try {
      await excluirDisciplina(disciplina.id)
      setDisciplinas((current) => current.filter((item) => item.id !== disciplina.id))
      setExpandedDisciplinaId((current) => (
        current === disciplina.id ? null : current
      ))
    } catch (error) {
      setErrorMessage(`Não foi possível excluir a disciplina: ${error.message}`)
    }
  }

  async function handleCreateConteudo(disciplinaId, values) {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const conteudo = await criarConteudo({ ...values, disciplina_id: disciplinaId })
      setDisciplinas((current) =>
        current.map((disciplina) =>
          disciplina.id === disciplinaId
            ? {
              ...disciplina,
              conteudos: [...disciplina.conteudos, { ...conteudo, listaQuestoes: [] }],
            }
            : disciplina,
        ),
      )
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível salvar o conteúdo: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateConteudo(id, values) {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const conteudoAtualizado = await editarConteudo(id, values)
      setDisciplinas((current) =>
        atualizarConteudo(current, id, (conteudo) => ({
          ...conteudoAtualizado,
          listaQuestoes: conteudo.listaQuestoes,
        })),
      )
      setEditingConteudoId(null)
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível atualizar o conteúdo: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteConteudo(id, nome) {
    if (!window.confirm(`Excluir o conteúdo "${nome}"?`)) return

    setErrorMessage('')
    try {
      await excluirConteudo(id)
      setDisciplinas((current) =>
        current.map((disciplina) => ({
          ...disciplina,
          conteudos: disciplina.conteudos.filter((conteudo) => conteudo.id !== id),
        })),
      )
    } catch (error) {
      setErrorMessage(`Não foi possível excluir o conteúdo: ${error.message}`)
    }
  }

  async function handleCreateListaQuestoes(conteudoId, values) {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const registro = await criarListaQuestoes({ ...values, conteudo_id: conteudoId })
      setDisciplinas((current) =>
        atualizarConteudo(current, conteudoId, (conteudo) => ({
          ...conteudo,
          listaQuestoes: [registro, ...conteudo.listaQuestoes],
        })),
      )
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível registrar as questões: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleUpdateListaQuestoes(id, conteudoId, values) {
    setIsSaving(true)
    setErrorMessage('')
    try {
      const registroAtualizado = await editarListaQuestoes(id, values)
      setDisciplinas((current) =>
        atualizarConteudo(current, conteudoId, (conteudo) => ({
          ...conteudo,
          listaQuestoes: conteudo.listaQuestoes.map((registro) =>
            registro.id === id ? registroAtualizado : registro,
          ),
        })),
      )
      setEditingListaQuestoesId(null)
      return true
    } catch (error) {
      setErrorMessage(`Não foi possível atualizar o registro de questões: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteListaQuestoes(id, conteudoId) {
    if (!window.confirm('Excluir este registro de questões?')) return
    setErrorMessage('')
    try {
      await excluirListaQuestoes(id)
      setDisciplinas((current) =>
        atualizarConteudo(current, conteudoId, (conteudo) => ({
          ...conteudo,
          listaQuestoes: conteudo.listaQuestoes.filter((registro) => registro.id !== id),
        })),
      )
    } catch (error) {
      setErrorMessage(`Não foi possível excluir o registro de questões: ${error.message}`)
    }
  }

  return (
    <>
      <button className="back-link" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> Voltar aos processos
      </button>

      <section className="page-intro detail-intro">
        <div>
          <p className="eyebrow">Organize sua preparação</p>
          <h1>{processo.nome}</h1>
          <p className="page-description">
            Cadastre as disciplinas e acompanhe o domínio dos conteúdos.
          </p>
        </div>
        <div className="mastery-card" aria-label="Domínio geral do processo">
          <span>Domínio geral</span>
          <strong>{progresso === null ? '—' : formatarDominio(progresso)}</strong>
          <small>Média ponderada pelas disciplinas</small>
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

      <section className="detail-grid" aria-label="Disciplinas e conteúdos do processo">
        <div className="panel discipline-form-panel">
          <div className="panel-heading">
            <span className="panel-icon" aria-hidden="true">+</span>
            <div>
              <h2>Nova disciplina</h2>
              <p>Defina o nome e o peso no processo.</p>
            </div>
          </div>
          <DisciplinaForm onSubmit={handleCreateDisciplina} isSaving={isSaving} />
        </div>

        <div className="discipline-list-section">
          <div className="section-heading">
            <div>
              <h2>Disciplinas</h2>
              <p>{disciplinas.length} {disciplinas.length === 1 ? 'cadastrada' : 'cadastradas'}</p>
              {disciplinas.length > 0 && (
                <p className="discipline-expand-hint">
                  Clique no nome da disciplina para expandir ou recolher os conteúdos.
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="list-message" role="status">Carregando disciplinas...</div>
          ) : loadFailed ? (
            <div className="list-message">
              <p>Não foi possível consultar a estrutura deste processo.</p>
              <button className="button button--secondary" type="button" onClick={handleRetry}>
                Tentar novamente
              </button>
            </div>
          ) : disciplinas.length ? (
            <div className="discipline-list">
              {disciplinas.map((disciplina) => {
                const dominio = calcularDominio(disciplina.conteudos)
                const isExpanded = expandedDisciplinaId === disciplina.id
                const conteudosId = `conteudos-disciplina-${disciplina.id}`
                return (
                  <article className="discipline-card" key={disciplina.id}>
                    {editingDisciplinaId === disciplina.id ? (
                      <>
                        <h3 className="nested-edit-title">Editar disciplina</h3>
                        <DisciplinaForm
                          initialValues={disciplina}
                          fieldPrefix={`disciplina-${disciplina.id}`}
                          onSubmit={(values) => handleUpdateDisciplina(disciplina.id, values)}
                          onCancel={() => setEditingDisciplinaId(null)}
                          isSaving={isSaving}
                        />
                      </>
                    ) : (
                      <>
                        <div className="discipline-heading">
                          <button
                            className="discipline-toggle"
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={conteudosId}
                            onClick={() => setExpandedDisciplinaId(
                              isExpanded ? null : disciplina.id,
                            )}
                          >
                            <span className="discipline-title">
                              <span className="discipline-name">{disciplina.nome}</span>
                              <span className="weight-badge">Peso {disciplina.peso}</span>
                            </span>
                            <span className="discipline-toggle-action">
                              {isExpanded ? 'Recolher conteúdos' : 'Expandir conteúdos'}
                            </span>
                            <span className="discipline-chevron" aria-hidden="true">⌄</span>
                          </button>
                          <div className="nested-actions">
                            <button
                              className="button button--update"
                              type="button"
                              onClick={() => setEditingDisciplinaId(disciplina.id)}
                              disabled={isSaving}
                              aria-label={`Editar ${disciplina.nome}`}
                            >
                              Editar
                            </button>
                            <button
                              className="button button--delete"
                              type="button"
                              onClick={() => handleDeleteDisciplina(disciplina)}
                              disabled={isSaving}
                              aria-label={`Excluir ${disciplina.nome}`}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                        <div className="discipline-summary">
                          <span>{disciplina.conteudos.length} {disciplina.conteudos.length === 1 ? 'conteúdo' : 'conteúdos'}</span>
                          <span>Domínio: {dominio === null ? '—' : formatarDominio(dominio)}</span>
                        </div>

                        <div className="discipline-content" id={conteudosId} hidden={!isExpanded}>
                          <div className="content-list">
                            {disciplina.conteudos.map((conteudo) => (
                              <div className="content-item" key={conteudo.id}>
                                {editingConteudoId === conteudo.id ? (
                                  <ConteudoForm
                                    initialValues={conteudo}
                                    fieldPrefix={`conteudo-${conteudo.id}`}
                                    onSubmit={(values) => handleUpdateConteudo(conteudo.id, values)}
                                    onCancel={() => setEditingConteudoId(null)}
                                    isSaving={isSaving}
                                  />
                                ) : (
                                  <>
                                    <div className="content-item-heading">
                                      <div>
                                        <h4>{conteudo.nome}</h4>
                                        {conteudo.descricao && (
                                          <p className="content-description">{conteudo.descricao}</p>
                                        )}
                                      </div>
                                      <span className="mastery-badge">
                                        <span aria-hidden="true">
                                          {obterDominio(conteudo.nivel_conhecimento).emoji}
                                        </span>
                                        {' '}{conteudo.nivel_conhecimento}/5
                                      </span>
                                    </div>
                                    <div className="content-item-actions">
                                      <button
                                        className="text-action"
                                        type="button"
                                        onClick={() => setEditingConteudoId(conteudo.id)}
                                        disabled={isSaving}
                                      >
                                        Editar
                                      </button>
                                      <button
                                        className="text-action text-action--delete"
                                        type="button"
                                        onClick={() => handleDeleteConteudo(conteudo.id, conteudo.nome)}
                                        disabled={isSaving}
                                      >
                                        Excluir
                                      </button>
                                    </div>
                                    {(() => {
                                      const registros = conteudo.listaQuestoes ?? []
                                      const resumo = calcularAproveitamento(registros)
                                      return (
                                        <details className="question-history">
                                          <summary>
                                            <span>📚 Questões resolvidas</span>
                                            <span className="question-history-count">
                                              {registros.length}
                                            </span>
                                          </summary>
                                          {resumo.totalQuestoes > 0 && (
                                            <div className="question-history-summary">
                                              <strong>{resumo.totalAcertos}/{resumo.totalQuestoes}</strong>
                                              <span>
                                                {formatarDominio(resumo.percentual)} de aproveitamento acumulado
                                              </span>
                                            </div>
                                          )}
                                          {registros.length > 0 && (
                                            <div className="question-history-list">
                                              {registros.map((registro) => {
                                                const dataRegistro = new Intl.DateTimeFormat(
                                                  'pt-BR',
                                                  { dateStyle: 'medium' },
                                                ).format(new Date(registro.created_at))
                                                return (
                                                  <div className="question-history-item" key={registro.id}>
                                                    {editingListaQuestoesId === registro.id ? (
                                                      <ListaQuestoesForm
                                                        initialValues={registro}
                                                        fieldPrefix={`questoes-${registro.id}`}
                                                        onSubmit={(values) =>
                                                          handleUpdateListaQuestoes(
                                                            registro.id,
                                                            conteudo.id,
                                                            values,
                                                          )
                                                        }
                                                        onCancel={() => setEditingListaQuestoesId(null)}
                                                        isSaving={isSaving}
                                                      />
                                                    ) : (
                                                      <>
                                                        <div>
                                                          <strong>
                                                            {registro.quantidade_acertos}/
                                                            {registro.quantidade_questoes} acertos
                                                          </strong>
                                                          <span>{dataRegistro}</span>
                                                        </div>
                                                        <div className="question-history-actions">
                                                          <button
                                                            className="text-action"
                                                            type="button"
                                                            onClick={() =>
                                                              setEditingListaQuestoesId(registro.id)
                                                            }
                                                            disabled={isSaving}
                                                          >
                                                            Editar
                                                          </button>
                                                          <button
                                                            className="text-action text-action--delete"
                                                            type="button"
                                                            onClick={() =>
                                                              handleDeleteListaQuestoes(
                                                                registro.id,
                                                                conteudo.id,
                                                              )
                                                            }
                                                            disabled={isSaving}
                                                          >
                                                            Excluir
                                                          </button>
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                )
                                              })}
                                            </div>
                                          )}
                                          <div className="question-history-add">
                                            <ListaQuestoesForm
                                              fieldPrefix={`novas-questoes-${conteudo.id}`}
                                              onSubmit={(values) =>
                                                handleCreateListaQuestoes(conteudo.id, values)
                                              }
                                              isSaving={isSaving}
                                            />
                                          </div>
                                        </details>
                                      )
                                    })()}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          <details className="add-content">
                            <summary>+ Adicionar conteúdo</summary>
                            <ConteudoForm
                              fieldPrefix={`novo-conteudo-${disciplina.id}`}
                              onSubmit={(values) => handleCreateConteudo(disciplina.id, values)}
                              isSaving={isSaving}
                            />
                          </details>
                        </div>
                      </>
                    )}
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">◎</span>
              <h3>Nenhuma disciplina cadastrada</h3>
              <p>Adicione uma disciplina para começar a organizar os conteúdos deste processo.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default ProcessoDetalhe
