import {
  BarChart3,
  ClipboardList,
  FileUp,
  FolderOpen,
  LayoutDashboard,
  Mail,
  LockKeyhole,
  Settings,
  UserCircle2,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload-excel', label: 'Upload Excel', icon: FileUp },
  { to: '/email-template', label: 'Email Template',
    
    icon: Mail, locked: true },
  { to: '/attachments', label: 'Attachments', icon: FolderOpen, locked: true },
  { to: '/history', label: 'History', icon: ClipboardList, locked: true },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <span className="brand-mark">
            <BarChart3 size={20} />
          </span>
          <span>
            Mail Automation
            <div className="muted" style={{ fontSize: '0.84rem', fontWeight: 500 }}>
              Campaign control center
            </div>
          </span>
        </div>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon, locked }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              {label}
              {locked ? <LockKeyhole size={14} style={{ marginLeft: 'auto' }} /> : null}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="panel" style={{ padding: 16 }}>
        <div className="badge">Sync status: connected</div>
        <p className="muted" style={{ marginTop: 12 }}>
          Excel imports, rich templates, and delivery history are all tracked in one workspace.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar