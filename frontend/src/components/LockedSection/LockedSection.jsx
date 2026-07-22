import { LockKeyhole, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../Button/Button'

function LockedSection({ title }) {
  return (
    <section className="dashboard-card" style={{ display: 'grid', placeItems: 'center', minHeight: 420, textAlign: 'center' }}>
      <div className="empty-state" style={{ minHeight: 'auto', gap: 16 }}>
        <div className="upload-icon" style={{ width: 64, height: 64 }}>
          <LockKeyhole size={28} />
        </div>
        <div>
          <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
            {title} is locked
          </h2>
          <p className="muted" style={{ maxWidth: 520, marginTop: 8 }}>
            This section is disabled for now and cannot be opened from the workspace.
          </p>
        </div>
        <div className="badge">
          <ShieldAlert size={16} />
          Access restricted
        </div>
        <Button as={Link} to="/dashboard" variant="secondary">
          Return to dashboard
        </Button>
      </div>
    </section>
  )
}

export default LockedSection