import { useState } from 'react'

const initialForm = {
  nome: '',
  descricao: '',
  status: 'Em andamento',
}

function ProcessoForm({
  onSubmit,
  initialValues = initialForm,
  submitLabel = 'Adicionar processo',
  fieldPrefix = 'processo',
  onCancel,
  isLoading,
  isSaving,
}) {
  const [form, setForm] = useState(() => ({
    nome: initialValues.nome ?? '',
    descricao: initialValues.descricao ?? '',
    status: initialValues.status ?? initialForm.status,
  }))

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const saved = await onSubmit({
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      status: form.status,
    })

    if (saved && !onCancel) {
      setForm(initialForm)
    }
  }

  return (
    <form className={`process-form${onCancel ? ' process-form--edit' : ''}`} onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor={`${fieldPrefix}-nome`}>Nome do processo</label>
        <input
          id={`${fieldPrefix}-nome`}
          name="nome"
          type="text"
          value={form.nome}
          onChange={handleChange}
          placeholder="Ex.: Concurso para Analista"
          maxLength={150}
          disabled={isSaving || isLoading}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor={`${fieldPrefix}-descricao`}>Descrição</label>
        <textarea
          id={`${fieldPrefix}-descricao`}
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          placeholder="Adicione detalhes sobre este processo seletivo"
          rows={3}
          disabled={isSaving || isLoading}
        />
      </div>

      <div className="form-actions">
        <div className="form-field form-field--status">
          <label htmlFor={`${fieldPrefix}-status`}>Status</label>
          <select
            id={`${fieldPrefix}-status`}
            name="status"
            value={form.status}
            onChange={handleChange}
            disabled={isSaving || isLoading}
          >
            <option>Em andamento</option>
            <option>Concluído</option>
            <option>Lista de desejos</option>
            <option>Pausado</option>
          </select>
        </div>
        <button
          className="button button--primary"
          type="submit"
          disabled={isSaving || isLoading}
        >
          {isSaving ? 'Salvando...' : isLoading ? 'Carregando...' : submitLabel}
        </button>
        {onCancel && (
          <button
            className="button button--secondary button--cancel"
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

export default ProcessoForm
