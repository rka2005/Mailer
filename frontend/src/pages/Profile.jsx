import { UserCircle2 } from 'lucide-react'
import Button from '../components/Button/Button'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user } = useAuth()

  return (
    <section className="dashboard-card">
      <div className="page-header">
        <div>
          <h2 className="page-title">Profile</h2>
          <p className="page-subtitle">Manage the account that owns this workspace.</p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="panel" style={{ padding: 20 }}>
          <div className="brand" style={{ marginBottom: 16 }}>
            <span className="brand-mark">
              <UserCircle2 size={20} />
            </span>
            <span>
              {user?.name || 'Team User'}
              <div className="muted" style={{ fontSize: '0.84rem', fontWeight: 500 }}>
                Workspace owner
              </div>
            </span>
          </div>
          <p className="muted">{user?.email || 'admin@mail.com'}</p>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div className="form">
            <div className="field">
              <label>Display name</label>
              <input className="input" defaultValue={user?.name || 'Team User'} />
            </div>
            <div className="field">
              <label>Email</label>
              <input className="input" defaultValue={user?.email || 'admin@mail.com'} />
            </div>
            <Button>Update profile</Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Profile