import { FileSpreadsheet, UploadCloud } from 'lucide-react'
import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

function DragDropUpload({ onFilesAccepted, multiple = false }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      onFilesAccepted?.(acceptedFiles)
    },
    [onFilesAccepted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
  })

  return (
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
      <input {...getInputProps()} />
      <div className="upload-icon">
        {isDragActive ? <UploadCloud size={20} /> : <FileSpreadsheet size={20} />}
      </div>
      <div>
        <h3 className="card-title">Drop your spreadsheet here</h3>
        <p className="muted">Drag and drop an Excel or CSV file, or click to browse.</p>
      </div>
    </div>
  )
}

export default DragDropUpload