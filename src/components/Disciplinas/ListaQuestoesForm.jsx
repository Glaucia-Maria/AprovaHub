import { useState } from 'react'

function ListaQuestoesForm({ initialValues, fieldPrefix, onSubmit, onCancel, isSaving }) {
  const [quantidadeQuestoes, setQuantidadeQuestoes] = useState(
    String(initialValues?.quantidade_questoes ?? ''),
  )
  const [quantidadeAcertos, setQuantidadeAcertos] = useState(
    String(initialValues?.quantidade_acertos ?? ''),
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const total = Number(quantidadeQuestoes)
    const acertos = Number(quantidadeAcertos)
    if (!Number.isInteger(total) || total < 1 || !Number.isInteger(acertos) || acertos < 0 || acertos > total) {
      return
    }

    const saved = await onSubmit({
      quantidade_questoes: total,
      quantidade_acertos: acertos,
    })

    if (saved && !onCancel) {
      setQuantidadeQuestoes('')
      setQuantidadeAcertos('')
    }
  }

  return (
    <form className="question-log-form" onSubmit={handleSubmit}>
      <div className="question-log-fields">
        <div className="form-field">
          <label htmlFor={`${fieldPrefix}-total`}>Questões feitas</label>
          <input
            id={`${fieldPrefix}-total`}
            type="number"
            min="1"
            step="1"
            value={quantidadeQuestoes}
            onChange={(event) => setQuantidadeQuestoes(event.target.value)}
            disabled={isSaving}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${fieldPrefix}-acertos`}>Acertos</label>
          <input
            id={`${fieldPrefix}-acertos`}
            type="number"
            min="0"
            max={quantidadeQuestoes || undefined}
            step="1"
            value={quantidadeAcertos}
            onChange={(event) => setQuantidadeAcertos(event.target.value)}
            disabled={isSaving}
            required
          />
        </div>
      </div>
      <div className="nested-form-actions">
        <button className="button button--primary" type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : onCancel ? 'Salvar alterações' : 'Registrar questões'}
        </button>
        {onCancel && (
          <button
            className="button button--secondary"
            type="button"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

export default ListaQuestoesForm
