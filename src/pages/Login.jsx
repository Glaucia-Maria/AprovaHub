import { useState } from 'react'

function Login({ onSubmit, errorMessage, onDismissError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(email.trim(), password)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <a className="brand login-brand" href="/" aria-label="AprovaHub">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>Aprova<span className="brand-highlight">Hub</span></span>
        </a>
        <p className="eyebrow">Sua preparação, em um só lugar</p>
        <h1 id="login-title">Que bom ter você de volta!</h1>
        <p className="login-description">
          Entre para continuar sua jornada rumo à aprovação.
        </p>

        {errorMessage && (
          <div className="alert alert--error login-alert" role="alert">
            <span>{errorMessage}</span>
            <button
              className="alert-dismiss"
              type="button"
              aria-label="Fechar mensagem de erro"
              onClick={onDismissError}
            >
              ×
            </button>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="login-email">E-mail</label>
            <input
              autoComplete="username"
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@exemplo.com"
              maxLength={254}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="login-password">Senha</label>
            <input
              autoComplete="current-password"
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              disabled={isSubmitting}
              required
            />
          </div>
          <button className="button button--primary login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="login-footnote">Acesse com seu e-mail e senha cadastrados.</p>
      </section>
    </main>
  )
}

export default Login
