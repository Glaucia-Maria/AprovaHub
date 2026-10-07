import { useState } from 'react'
import { dominioNiveis } from './dominioNiveis'

function ConteudoForm({
  initialValues = { nome: '', descricao: '', nivel_conhecimento: '1' },
  onSubmit,
  onCancel,
  isSaving,
  fieldPrefix = 'conteudo',
}) {
  const [nome, setNome] = useState(initialValues.nome ?? '')
  const [descricao, setDescricao] = useState(initialValues.descricao ?? '')
  const [nivel, setNivel] = useState(String(initialValues.nivel_conhecimento ?? 1))

  async function handleSubmit(event) {
    event.preventDefault()
    const saved = await onSubmit({
      nome: nome.trim(),
      descricao: descricao.trim(),
      nivel_conhecimento: Number(nivel),
    })
    if (saved && !onCancel) {
      setNome('')
      setDescricao('')
      setNivel('1')
    }
  }

  return (
    <form className="nested-form content-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor={`${fieldPrefix}-nome`}>Nome do conteúdo</label>
        <input
          id={`${fieldPrefix}-nome`}
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          placeholder="Ex.: Interpretação de textos"
          maxLength={150}
          disabled={isSaving}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor={`${fieldPrefix}-descricao`}>Descrição (opcional)</label>
        <textarea
          id={`${fieldPrefix}-descricao`}
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          placeholder="Detalhes ou observações sobre o conteúdo"
          rows={2}
          disabled={isSaving}
        />
      </div>
      <fieldset className="rating-fieldset" disabled={isSaving}>
        <legend>Nível de domínio</legend>
        <div className="rating-options" role="radiogroup" aria-label="Nível de domínio do conteúdo">
          {dominioNiveis.map((item) => (
            <label
              className={`rating-option${Number(nivel) === item.nivel ? ' rating-option--selected' : ''}`}
              key={item.nivel}
              title={`${item.nivel} de 5: ${item.descricao}`}
            >
              <input
                type="radio"
                name={`${fieldPrefix}-nivel`}
                value={item.nivel}
                checked={Number(nivel) === item.nivel}
                onChange={(event) => setNivel(event.target.value)}
                required
              />
              <span className="rating-emoji" aria-hidden="true">{item.emoji}</span>
              <span className="rating-number">{item.nivel}</span>
            </label>
          ))}
        </div>
        <ul className="rating-legend" aria-label="Legenda dos níveis de domínio">
          {dominioNiveis.map((item) => (
            <li key={item.nivel}>
              <span aria-hidden="true">{item.emoji}</span>
              <span><strong>{item.nivel}.</strong> {item.descricao}</span>
            </li>
          ))}
        </ul>
      </fieldset>
      <div className="nested-form-actions">
        <button className="button button--primary" type="submit" disabled={isSaving}>
          {isSaving ? 'Salvando...' : onCancel ? 'Salvar alterações' : 'Adicionar conteúdo'}
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

export default ConteudoForm
