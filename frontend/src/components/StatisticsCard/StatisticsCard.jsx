import { ArrowUpRight } from 'lucide-react'

function StatisticsCard({ title, value, description, icon: Icon, trend = '12% this month' }) {
  return (
    <article className="stats-card">
      <div className="card-header">
        <div className="stats-icon">{Icon ? <Icon size={20} /> : null}</div>
        <span className="metric-pill">
          <ArrowUpRight size={16} />
          {trend}
        </span>
      </div>
      <div>
        <h3 className="card-title">{title}</h3>
        <div className="stats-value">{value}</div>
      </div>
      <p className="muted">{description}</p>
    </article>
  )
}

export default StatisticsCard