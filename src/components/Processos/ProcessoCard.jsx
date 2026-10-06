import ProcessoForm from './ProcessoForm'

const statusClasses = {
  'Em andamento': 'status-badge--active',
  'Concluído': 'status-badge--complete',
  'Pausado': 'status-badge--paused',
  'Lista de desejos': 'status-badge--wishlist',
}

function ProcessoCard({
  processo,
  onDelete,
  onEdit,
  onUpdate,
  isEditing,
  isDeleting,
  isUpdating,
  isBusy,
}) {
  const dataCriacao = processo.created_at
    ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(
        new Date(processo.created_at),
      )
    : null

  return (
    <article className="process-card">
      {isEditing ? (
        <>
          <div className="process-card-heading process-card-heading--editing">
            <h3>Editar processo</h3>
          </div>
          <ProcessoForm
            initialValues={processo}
            fieldPrefix={`processo-${processo.id}`}
            onSubmit={(values) => onUpdate(processo.id, values)}
            submitLabel="Salvar alterações"
            onCancel={() => onEdit(null)}
            isSaving={isUpdating}
          />
        </>
      ) : (
        <>
          <div className="process-card-heading">
            <div className="process-card-title">
              <h3>{processo.nome}</h3>
              <span className={`status-badge ${statusClasses[processo.status] ?? ''}`}>
                {processo.status}
              </span>
            </div>
            <div className="process-card-actions">
              <button
                className="button button--update"
                type="button"
                onClick={() => onEdit(processo.id)}
                disabled={isBusy}
                aria-label={`Editar ${processo.nome}`}
              >
                Editar
              </button>
              <button
                className="button button--delete"
                type="button"
                onClick={() => onDelete(processo)}
                disabled={isBusy}
                aria-label={`Excluir ${processo.nome}`}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
          {processo.descricao && <p className="process-description">{processo.descricao}</p>}
          {dataCriacao && (
            <p className="process-date">
              Cadastrado em <time dateTime={processo.created_at}>{dataCriacao}</time>
            </p>
          )}
        </>
      )}
    </article>
  )
}

export default ProcessoCard
