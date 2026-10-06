function AppLayout({ children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="AprovaHub, início">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span>Aprova<span className="brand-highlight">Hub</span></span>
        </a>
        <span className="topbar-caption">Sua preparação, em um só lugar</span>
      </header>
      <main className="main-content">{children}</main>
    </div>
  )
}

export default AppLayout
