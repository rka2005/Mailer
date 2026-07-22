import { Paperclip, Plus } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/Button/Button'

const starterAttachments = [
  { name: 'Offer-terms.pdf', type: 'PDF', size: '1.2 MB' },
  { name: 'Pricing-sheet.xlsx', type: 'Spreadsheet', size: '860 KB' },
  { name: 'Brand-guidelines.zip', type: 'Archive', size: '8.6 MB' },
]

function Attachments() {
  const [attachments] = useState(starterAttachments)

  return (
    <section className="dashboard-card">
      <div className="page-header">
        <div>
          <h2 className="page-title">Attachments</h2>
          <p className="page-subtitle">Keep shared files ready for bulk email sends.</p>
        </div>
        <Button>
          <Plus size={16} />
          Add attachment
        </Button>
      </div>

      <div className="stack">
        {attachments.map((attachment) => (
          <div className="upload-item" key={attachment.name}>
            <div className="upload-item-main">
              <div className="upload-icon">
                <Paperclip size={18} />
              </div>
              <div>
                <h3 className="card-title">{attachment.name}</h3>
                <p className="muted">
                  {attachment.type} · {attachment.size}
                </p>
              </div>
            </div>
            <span className="badge">Ready</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Attachments