import { useState } from 'react'

function DisciplinaForm({
  initialValues = { nome: '', peso: '1' },
  onSubmit,
  onCancel,
  isSaving,
  fieldPrefix = 'disciplina',
}) {
  const [nome, setNome] = useState(initialValues.nome ?? '')
  const [peso, setPeso] = useState(String(initialValues.peso ?? 1))

  async function handleSubmit(event) {
    event.preventDefault()
    const saved = await onSubmit({ nome: nome.trim(), peso: Number(peso) })
    if (saved && !onCancel) {
      setNome('')
      setPeso('1')
    }
  }

  return (
    <form className="nested-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor={`${fieldPrefix}-nome`}>Nome da disciplina</label>
        <input
          id={`${fieldPrefix}-nome`}
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          placeholder="Ex.: Língua Portuguesa"
          maxLength={150}
          disabled={isSaving}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor={`${fieldPrefix}-peso`}>Peso</label>
        <input
          id={`${fieldPrefix}-peso`}
          type="number"
          min="0.01"
          step="0.01"
          value={peso}
          onChange={(event) => setPeso(event.target.value)}
          disabled={isSaving}
          required
        />
      </div>
      <div className="nested-form-actions">
        <button className="button button--primary" type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : onCancel ? 'Salvar alterações' : 'Adicionar disciplina'}
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

export default DisciplinaForm
