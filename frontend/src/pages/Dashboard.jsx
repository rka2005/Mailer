import { AlertCircle, AlertTriangle, BarChart3, CheckCircle2, Loader2, Mail, Send, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatisticsCard from '../components/StatisticsCard/StatisticsCard'
import { getStatusInfo } from './UploadExcel'

const recentCampaigns = [
  { name: 'Launch announcement', audience: '1,240 recipients', status: 'Queued' },
  { name: 'Weekly product update', audience: '820 recipients', status: 'Sent' },
  { name: 'Re-engagement series', audience: '430 recipients', status: 'Completed with Errors' },
]

function Dashboard() {
  return (
    <div className="dashboard-grid">
      <section className="stats-grid">
        <StatisticsCard title="Recipients imported" value="12.4k" description="Rows mapped from your latest Excel upload." icon={Upload} trend="+18% this week" />
        <StatisticsCard title="Emails sent" value="9.8k" description="Campaign delivery volume across active sequences." icon={Send} trend="+9% this week" />
        <StatisticsCard title="Open rate" value="38.2%" description="Average engagement across recent broadcasts." icon={BarChart3} trend="+4.1 pts" />
      </section>

      <section className="dashboard-card">
        <div className="section-header">
          <div>
            <h2 className="section-title">Quick actions</h2>
            <p className="muted">Jump into the most common campaign steps.</p>
          </div>
          <Link className="nav-pill" to="/history">
            View history
          </Link>
        </div>

        <div className="chip-list">
          <Link className="btn btn-secondary" to="/upload-excel">
            <Upload size={16} />
            Upload Excel
          </Link>
          <Link className="btn btn-secondary" to="/email-template">
            <Mail size={16} />
            Open template editor
          </Link>
          <Link className="btn btn-secondary" to="/attachments">
            <Send size={16} />
            Manage attachments
          </Link>
        </div>
      </section>

      <section className="table-card" style={{ gridColumn: '1 / -1' }}>
        <div className="table-header">
          <div>
            <h2 className="section-title">Recent campaigns</h2>
            <p className="muted">A quick view of your latest message batches.</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Audience</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentCampaigns.map((campaign) => {
                const statusInfo = getStatusInfo(campaign.status)
                return (
                  <tr key={campaign.name}>
                    <td>{campaign.name}</td>
                    <td>{campaign.audience}</td>
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
    </div>
  )
}

export default Dashboard