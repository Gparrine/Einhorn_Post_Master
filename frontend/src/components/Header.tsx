import einhornLogo from '../assets/einhorn_logo_yellow_on_transparent_large.png'

export default function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <img
          src={einhornLogo}
          alt="Einhorn logo"
          className="header-logo"
        />
        <h1 className="header-title">Einhorn Postmaster</h1>
      </div>
      <div className="header-divider" />
    </header>
  )
}
