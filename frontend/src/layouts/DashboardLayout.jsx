import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer/Footer'
import Header from '../components/Header/Header'
import Sidebar from '../components/Sidebar/Sidebar'

function DashboardLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-area">
        <Header
          title="Dashboard"
          subtitle="Manage uploads, draft messages, and review send history from one place."
        />
        <Outlet />
        <Footer />
      </main>
    </div>
  )
}

export default DashboardLayout