import { useState } from 'react'

function dataHoje() {
  const hoje = new Date()
  const offset = hoje.getTimezoneOffset() * 60_000
  return new Date(hoje.getTime() - offset).toISOString().slice(0, 10)
}

function SimuladoForm({
  processos,
  initialValues,
  onSubmit,
  onCancel,
  isSaving,
  fieldPrefix = 'novo-simulado',
}) {
  const [form, setForm] = useState(() => ({
    processo_seletivo_id: initialValues?.processo_seletivo_id ?? processos[0]?.id ?? '',
    nome: initialValues?.nome ?? '',
    data: initialValues?.data ?? dataHoje(),
    quantidade_questoes: initialValues?.quantidade_questoes ?? '',
    quantidade_acertos: initialValues?.quantidade_acertos ?? '',
    observacao: initialValues?.observacao ?? '',
  }))

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const total = Number(form.quantidade_questoes)
    const acertos = Number(form.quantidade_acertos)
    if (acertos > total) return

    const saved = await onSubmit({
      ...form,
      quantidade_questoes: total,
      quantidade_acertos: acertos,
    })

    if (saved && !onCancel) {
      setForm({
        processo_seletivo_id: processos[0]?.id ?? '',
        nome: '',
        data: dataHoje(),
        quantidade_questoes: '',
        quantidade_acertos: '',
        observacao: '',
      })
    }
  }

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor={`${fieldPrefix}-processo`}>Processo seletivo</label>
        <select
          id={`${fieldPrefix}-processo`}
          name="processo_seletivo_id"
          value={form.processo_seletivo_id}
          onChange={handleChange}
          disabled={isSaving || !processos.length}
          required
        >
          {processos.map((processo) => (
            <option key={processo.id} value={processo.id}>{processo.nome}</option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label htmlFor={`${fieldPrefix}-nome`}>Nome do simulado</label>
        <input
          id={`${fieldPrefix}-nome`}
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Ex.: Simulado de revisão #1"
          maxLength={150}
          disabled={isSaving}
          required
        />
      </div>
      <div className="record-form-row">
        <div className="form-field">
          <label htmlFor={`${fieldPrefix}-data`}>Data</label>
          <input
            id={`${fieldPrefix}-data`}
            name="data"
            type="date"
            value={form.data}
            onChange={handleChange}
            disabled={isSaving}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${fieldPrefix}-total`}>Total de questões</label>
          <input
            id={`${fieldPrefix}-total`}
            name="quantidade_questoes"
            type="number"
            min="1"
            step="1"
            value={form.quantidade_questoes}
            onChange={handleChange}
            disabled={isSaving}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor={`${fieldPrefix}-acertos`}>Acertos</label>
          <input
            id={`${fieldPrefix}-acertos`}
            name="quantidade_acertos"
            type="number"
            min="0"
            max={form.quantidade_questoes || undefined}
            step="1"
            value={form.quantidade_acertos}
            onChange={handleChange}
            disabled={isSaving}
            required
          />
        </div>
      </div>
      <div className="form-field">
        <label htmlFor={`${fieldPrefix}-observacao`}>Observação (opcional)</label>
        <textarea
          id={`${fieldPrefix}-observacao`}
          name="observacao"
          value={form.observacao}
          onChange={handleChange}
          placeholder="O que foi bem? O que quero revisar na próxima?"
          rows={3}
          disabled={isSaving}
        />
      </div>
      <div className="nested-form-actions">
        <button
          className="button button--primary"
          type="submit"
          disabled={isSaving || !processos.length}
        >
          {isSaving ? 'Salvando...' : onCancel ? 'Salvar alterações' : 'Guardar simulado'}
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

export default SimuladoForm
