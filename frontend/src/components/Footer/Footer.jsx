import { Mail, Phone } from 'lucide-react'

function Footer() {
  return (
    <footer 
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 32px',
        borderTop: '1px solid var(--border)',
        color: 'var(--muted)',
        fontSize: '14px',
        width: '100%',
        marginTop: 'auto'
      }}
    >
      {/* Left Side: Copyright */}
      <div>
        &copy; 2026 Mailer | All rights reserved
      </div>

      {/* Right Side: Contact Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>Contact:</span>
        
        <a 
          href="mailto:rohitadak0@gmail.com" 
          title="Email Us"
          style={{ 
            color: 'var(--muted)', 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color, var(--accent))'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
        >
          <Mail size={18} />
        </a>
        
        <a 
          href="tel:8348765905" 
          title="Call Us"
          style={{ 
            color: 'var(--muted)', 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color, var(--accent))'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
        >
          <Phone size={18} />
        </a>
      </div>
    </footer>
  )
}

export default Footer