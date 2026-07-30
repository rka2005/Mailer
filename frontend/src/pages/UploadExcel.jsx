import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, FileSpreadsheet, FileUp, Table2 } from 'lucide-react'
import { toast } from 'sonner'
import Button from '../components/Button/Button'
import DragDropUpload from '../components/DragDropUpload/DragDropUpload'
import UploadCard from '../components/UploadCard/UploadCard'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const TERMINAL_STATUSES = new Set(['COMPLETED', 'FAILED', 'CANCELLED'])

function formatStatus(status) {
  if (!status) return 'QUEUED'
  return String(status).replaceAll('_', ' ').toUpperCase()
}

function getStatusClass(status) {
  const value = String(status || '').toUpperCase()

  if (value === 'COMPLETED') return 'status-ok'
  if (value === 'FAILED' || value === 'CANCELLED') return 'status-error'
  return 'status-warning'
}

function clampProgress(progress) {
  const nextValue = Number(progress ?? 0)

  if (Number.isNaN(nextValue)) return 0

  return Math.min(100, Math.max(0, nextValue))
}

function UploadExcel() {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [previewRows, setPreviewRows] = useState([])
  const [previewColumns, setPreviewColumns] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [jobSnapshot, setJobSnapshot] = useState(null)
  const [uploadSummary, setUploadSummary] = useState(null)

  const activeFile = files[0] ?? null
  const jobProgress = clampProgress(jobSnapshot?.progress)

  useEffect(() => {
    if (!jobId) return undefined

    let isActive = true
    let intervalId

    const syncJobStatus = async () => {
      try {
        const response = await api.get(`/jobs/${jobId}`)
        if (!isActive) return

        const nextJob = response.data?.data ?? response.data
        setJobSnapshot(nextJob)

        if (TERMINAL_STATUSES.has(String(nextJob?.status || '').toUpperCase()) && intervalId) {
          window.clearInterval(intervalId)
        }
      } catch (error) {
        if (!isActive) return

        const message = error?.response?.data?.detail || error.message || 'Unable to load job progress'
        toast.error(message)

        if (intervalId) {
          window.clearInterval(intervalId)
        }
      }
    }

    syncJobStatus()
    intervalId = window.setInterval(syncJobStatus, 2500)

    return () => {
      isActive = false

      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [jobId])

  const handleFilesAccepted = async (acceptedFiles) => {
    if (!acceptedFiles.length) return

    const nextFile = acceptedFiles[0]
    setFiles([nextFile])
    setJobId(null)
    setJobSnapshot(null)
    setUploadSummary(null)

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
    setJobId(null)
    setJobSnapshot(null)
    setUploadSummary(null)
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

      const result = response.data ?? {}
      const resultRows = Array.isArray(result.preview) ? result.preview : previewRows
      const resultColumns = Array.isArray(result.columns) ? result.columns : previewColumns

      setPreviewRows(resultRows)
      setPreviewColumns(resultColumns)
      setUploadSummary({
        rowCount: result.rowCount ?? resultRows.length,
        totalParties: result.totalParties ?? 0,
      })
      setJobId(result.jobId ?? null)
      setJobSnapshot({
        jobId: result.jobId ?? null,
        status: 'QUEUING',
        currentStage: 'QUEUE',
        progress: 0,
        total: result.totalParties ?? 0,
        queued: result.totalParties ?? 0,
        completed: 0,
        failed: 0,
        processing: 0,
      })

      toast.success(
        `Uploaded ${result.rowCount ?? resultRows.length} rows and queued ${result.totalParties ?? 0} parties for processing.`,
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

        {jobSnapshot && (
          <div className="upload-progress-panel">
            <div className="upload-progress-header">
              <div>
                <p className="progress-label">Backend processing</p>
                <h4 className="card-title" style={{ marginTop: 4 }}>
                  {jobSnapshot.jobId || 'Processing job'}
                </h4>
              </div>
              <span className={`badge ${getStatusClass(jobSnapshot.status)}`}>
                {formatStatus(jobSnapshot.status)}
              </span>
            </div>

            <div className="progress-track" aria-label="Upload progress">
              <div className="progress-fill" style={{ width: `${jobProgress}%` }} />
            </div>

            <div className="progress-meta">
              <span>{jobProgress.toFixed(0)}% complete</span>
              <span>
                {(jobSnapshot.completed ?? 0) + (jobSnapshot.failed ?? 0)}
                /
                {jobSnapshot.total ?? 0}
                {' '}parties processed
              </span>
            </div>

            <p className="muted">
              Stage: {formatStatus(jobSnapshot.currentStage)}
              {jobSnapshot.failed ? ` · ${jobSnapshot.failed} failed` : ''}
            </p>
          </div>
        )}

        <div className="upload-list">
          {files.length ? (
            files.map((file) => (
              <UploadCard key={`${file.name}-${file.size}`} file={file} onRemove={() => removeFile(file.name)} />
            ))
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
            <p className="muted">
              {activeFile ? `Previewing ${activeFile.name}` : 'The first few rows are rendered locally before submission.'}
            </p>
          </div>
          <div className="preview-badges">
            <div className="badge">
              <Table2 size={16} />
              {previewRows.length ? `${previewRows.length} row preview` : 'No preview yet'}
            </div>
            {uploadSummary && (
              <div className="badge">
                {uploadSummary.rowCount} rows · {uploadSummary.totalParties} parties
              </div>
            )}
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