import { useMemo, useState } from 'react'
import { CheckCircle2, FileSpreadsheet, FileUp, Table2 } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/Button/Button'
import DragDropUpload from '../components/DragDropUpload/DragDropUpload'
import UploadCard from '../components/UploadCard/UploadCard'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function UploadExcel() {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [previewRows, setPreviewRows] = useState([])
  const [previewColumns, setPreviewColumns] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const activeFile = files[0] ?? null

  const handleFilesAccepted = async (acceptedFiles) => {
    if (!acceptedFiles.length) return

    const nextFile = acceptedFiles[0]
    setFiles([nextFile])
    console.log(response.data)

    try {
      const XLSX = await import('xlsx')
      const arrayBuffer = await nextFile.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]

      if (!sheetName) {
        throw new Error('No sheets found in the file')
      }

      const worksheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
      const normalizedRows = rows.slice(0, 8)
      const columns = normalizedRows.length ? Object.keys(normalizedRows[0]) : []

      setPreviewRows(normalizedRows)
      setPreviewColumns(columns)

      if (!columns.length) {
        toast.info('File loaded, but no data rows were found for preview')
      }
    } catch (error) {
      setPreviewRows([])
      setPreviewColumns([])
      toast.error(error instanceof Error ? error.message : 'Unable to read the spreadsheet')
    }
  }

  const removeFile = (name) => {
    setFiles((current) => current.filter((file) => file.name !== name))
    setPreviewRows([])
    setPreviewColumns([])
  }

  const handleSubmit = async () => {
    if (!activeFile) {
      toast.error('Choose a file before submitting')
      return
    }

    const formData = new FormData()
    formData.append('file', activeFile)

    if (user?.email) {
      formData.append('sender_email', user.email)
    }

    try {
      setSubmitting(true)
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const result = response.data?.data
      toast.success(
        `Processed ${result?.rows ?? 0} rows: ${result?.sent ?? 0} sent, ${result?.skipped ?? 0} skipped, ${result?.failed ?? 0} failed`,
      )
    } catch (error) {
      const message = error?.response?.data?.detail || error.message || 'Upload failed'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const previewTable = useMemo(() => {
    if (!previewRows.length || !previewColumns.length) return null

    return (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {previewColumns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row, index) => (
              <tr key={`${activeFile?.name ?? 'preview'}-${index}`}>
                {previewColumns.map((column) => (
                  <td key={column}>{String(row[column] ?? '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }, [activeFile?.name, previewColumns, previewRows])

  return (
    <section className="content-grid upload-workflow">
      <div className="dashboard-card">
        <div className="page-header">
          <div>
            <h2 className="page-title">Upload Excel</h2>
            <p className="page-subtitle">Import recipients, map columns, and prepare your send list.</p>
          </div>
          <div className="badge">
            <CheckCircle2 size={16} />
            Accepted: .xlsx, .xls, .csv
          </div>
        </div>

        <DragDropUpload onFilesAccepted={handleFilesAccepted} />
      </div>

      <div className="dashboard-card">
        <div className="section-header">
          <div>
            <h3 className="section-title">Uploaded files</h3>
            <p className="muted">Review the loaded file and submit it to the backend.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleSubmit} loading={submitting} disabled={!activeFile}>
            <FileUp size={16} />
            Submit to backend
          </Button>
        </div>

        <div className="upload-list">
          {files.length ? (
            files.map((file) => <UploadCard key={`${file.name}-${file.size}`} file={file} onRemove={() => removeFile(file.name)} />)
          ) : (
            <div className="empty-state">
              <FileSpreadsheet size={32} />
              <p>No files uploaded yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="table-card" style={{ gridColumn: '1 / -1' }}>
        <div className="table-header">
          <div>
            <h3 className="section-title">Spreadsheet preview</h3>
            <p className="muted">The first few rows are rendered locally before submission.</p>
          </div>
          <div className="badge">
            <Table2 size={16} />
            {previewRows.length ? `${previewRows.length} row preview` : 'No preview yet'}
          </div>
        </div>

        {previewTable || (
          <div className="empty-state" style={{ minHeight: 180 }}>
            <Table2 size={32} />
            <p>Drop a spreadsheet to see a preview.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default UploadExcel