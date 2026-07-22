import { Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import ThemeSwitch from '../ThemeSwitch/ThemeSwitch'

function Navbar() {
  return (
    <header className="public-nav">
      <Link className="brand" to="/login">
        <span className="brand-mark">
          <Mail size={20} />
        </span>
        <span>
          Mail Automation
          <div className="muted" style={{ fontSize: '0.84rem', fontWeight: 500 }}>
            Campaign workspace
          </div>
        </span>
      </Link>

      <nav className="public-nav-links">
        <Link className="nav-pill" to="/login">
          Login
        </Link>
        <Link className="nav-pill" to="/register">
          Register
        </Link>
        <Link className="btn btn-primary btn-sm" to="/dashboard">
          Get Started
        </Link>
        <ThemeSwitch />
      </nav>
    </header>
  )
}

export default Navbar