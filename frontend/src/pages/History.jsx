const historyRows = [
  { campaign: 'Launch announcement', sent: '1,240', opened: '498', status: 'Sent' },
  { campaign: 'Weekly digest', sent: '820', opened: '344', status: 'Sent' },
  { campaign: 'Promo blast', sent: '2,100', opened: '871', status: 'Queued' },
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
            {historyRows.map((row) => (
              <tr key={row.campaign}>
                <td>{row.campaign}</td>
                <td>{row.sent}</td>
                <td>{row.opened}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default History