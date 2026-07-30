import { getStatusInfo } from './UploadExcel'
import { AlertCircle, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'

const historyRows = [
  { campaign: 'Launch announcement', sent: '1,240', opened: '498', status: 'Sent' },
  { campaign: 'Weekly digest', sent: '820', opened: '344', status: 'Completed with Errors' },
  { campaign: 'Promo blast', sent: '2,100', opened: '871', status: 'Queued' },
  { campaign: 'System maintenance alert', sent: '0', opened: '0', status: 'Failed' },
]

function History() {
  return (
    <section className="table-card">
      <div className="page-header">
        <div>
          <h2 className="page-title">History</h2>
          <p className="page-subtitle">Track delivery batches, opens, and queue status.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Sent</th>
              <th>Opened</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {historyRows.map((row) => {
              const statusInfo = getStatusInfo(row.status)
              return (
                <tr key={row.campaign}>
                  <td>{row.campaign}</td>
                  <td>{row.sent}</td>
                  <td>{row.opened}</td>
                  <td>
                    <span className={statusInfo.className}>
                      {statusInfo.type === 'success' && <CheckCircle2 size={13} />}
                      {statusInfo.type === 'warning' && <AlertTriangle size={13} />}
                      {statusInfo.type === 'error' && <AlertCircle size={13} />}
                      {statusInfo.type === 'info' && <Loader2 size={13} className="spinner-icon" />}
                      {statusInfo.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default History