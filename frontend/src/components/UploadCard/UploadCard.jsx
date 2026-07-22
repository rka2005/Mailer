import { FileText, Trash2 } from 'lucide-react'
import Button from '../Button/Button'

function formatSize(bytes) {
  if (!bytes) return '0 KB'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

function UploadCard({ file, onRemove }) {
  return (
    <article className="upload-item">
      <div className="upload-item-main">
        <div className="upload-icon">
          <FileText size={18} />
        </div>
        <div>
          <h4 className="card-title" style={{ marginBottom: 4 }}>
            {file.name}
          </h4>
          <p className="muted">{formatSize(file.size)} · Ready to map recipients</p>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={onRemove}>
        <Trash2 size={16} />
        Remove
      </Button>
    </article>
  )
}

export default UploadCard