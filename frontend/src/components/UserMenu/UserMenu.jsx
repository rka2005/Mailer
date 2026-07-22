import { ChevronDown, LogOut, Settings, UserCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../Button/Button'
import { useAuth } from '../../context/AuthContext'

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="user-menu" style={{ position: 'relative' }}>
      <Button variant="secondary" onClick={() => setOpen((current) => !current)}>
        <UserCircle2 size={18} />
        {user?.name || 'Team User'}
        <ChevronDown size={16} />
      </Button>

      {open ? (
        <div
          className="surface"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 12px)',
            width: 220,
            padding: 10,
            zIndex: 30,
          }}
        >
          <Link className="nav-link" to="/profile" onClick={() => setOpen(false)}>
            <UserCircle2 size={16} />
            Profile
          </Link>
          <Link className="nav-link" to="/settings" onClick={() => setOpen(false)}>
            <Settings size={16} />
            Settings
          </Link>
          <button className="nav-link" type="button" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default UserMenu