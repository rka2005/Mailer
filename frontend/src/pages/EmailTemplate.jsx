import { Send } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/Button/Button'
import EmailEditor from '../components/EmailEditor/EmailEditor'

function EmailTemplate() {
  const handleSave = () => {
    toast.success('Template saved')
  }

  return (
    <section className="dashboard-card">
      <div className="page-header">
        <div>
          <h2 className="page-title">Email Template</h2>
          <p className="page-subtitle">Draft reusable content blocks for campaigns and follow-ups.</p>
        </div>
        <Button variant="secondary" onClick={handleSave}>
          <Send size={16} />
          Save and use
        </Button>
      </div>

      <EmailEditor onChange={() => {}} />
    </section>
  )
}

export default EmailTemplate