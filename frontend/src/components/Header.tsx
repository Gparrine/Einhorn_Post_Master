import logoPlaceholder from '../assets/logo-placeholder.svg'

export default function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <img
          src={logoPlaceholder}
          alt="Einhorn logo"
          className="header-logo"
        />
        <h1 className="header-title">Einhorn Postmaster</h1>
      </div>
      <div className="header-divider" />
    </header>
  )
}
