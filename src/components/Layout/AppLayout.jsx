const navigationItems = [
  { id: 'processos', icon: '🎯', label: 'Processos' },
  { id: 'simulados', icon: '📝', label: 'Simulados' },
  { id: 'mensagens', icon: '💌', label: 'Meu diário' },
]

function AppLayout({
  children,
  activePage,
  onNavigate,
  userEmail,
  onLogout,
  errorMessage,
  onDismissError,
}) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="AprovaHub, início">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>Aprova<span className="brand-highlight">Hub</span></span>
        </a>
        <div className="topbar-account">
          <span className="topbar-caption">{userEmail}</span>
          <button className="logout-button" type="button" onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>
      <nav className="main-nav" aria-label="Menu principal">
        {navigationItems.map((item) => (
          <button
            className={`nav-link${activePage === item.id ? ' nav-link--active' : ''}`}
            type="button"
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-current={activePage === item.id ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <main className="main-content">
        {errorMessage && (
          <div className="alert alert--error" role="alert">
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
        {children}
      </main>
    </div>
  )
}

export default AppLayout
