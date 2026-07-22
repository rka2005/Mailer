import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="public-shell">
      <div className="public-frame">
        <section className="empty-state" style={{ minHeight: '80vh' }}>
          <h1 className="page-title">404</h1>
          <p className="page-subtitle">The page you were looking for does not exist.</p>
          <Link className="btn btn-primary" to="/dashboard">
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>
        </section>
      </div>
    </div>
  )
}

export default NotFound