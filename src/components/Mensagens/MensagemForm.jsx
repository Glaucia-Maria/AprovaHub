import { useState } from 'react'

function MensagemForm({
  initialValues,
  onSubmit,
  onCancel,
  isSaving,
  fieldPrefix = 'nova-mensagem',
}) {
  const [mensagem, setMensagem] = useState(initialValues?.mensagem ?? '')

  async function handleSubmit(event) {
    event.preventDefault()
    const saved = await onSubmit({ mensagem: mensagem.trim() })
    if (saved && !onCancel) {
      setMensagem('')
    }
  }

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor={`${fieldPrefix}-texto`}>Sua mensagem</label>
        <textarea
          id={`${fieldPrefix}-texto`}
          value={mensagem}
          onChange={(event) => setMensagem(event.target.value)}
          placeholder="Uma pequena vitória, um lembrete gentil ou um plano para amanhã..."
          rows={5}
          maxLength={2000}
          disabled={isSaving}
          required
        />
      </div>
      <div className="nested-form-actions">
        <button className="button button--primary" type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : onCancel ? 'Salvar alterações' : 'Guardar recadinho'}
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

export default MensagemForm
