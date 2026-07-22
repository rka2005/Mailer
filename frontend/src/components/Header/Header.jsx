import { Bell, Search } from 'lucide-react'
import UserMenu from '../UserMenu/UserMenu'
import ThemeSwitch from '../ThemeSwitch/ThemeSwitch'

function Header({ title, subtitle }) {
  return (
    <div className="topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>

      <div className="toolbar-actions">
        <button className="btn btn-secondary btn-sm desktop-only" type="button">
          <Search size={16} />
          Search
        </button>
        <button className="btn btn-secondary btn-sm" type="button">
          <Bell size={16} />
        </button>
        <ThemeSwitch />
        <UserMenu />
      </div>
    </div>
  )
}

export default Header