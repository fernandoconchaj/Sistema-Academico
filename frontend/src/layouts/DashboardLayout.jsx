import Sidebar from '../components/Sidebar.jsx'
import Navbar from '../components/Navbar.jsx'

export default function DashboardLayout({ role, title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={role} />
      <div className="lg:pl-72 min-h-screen min-w-0">
        <Navbar title={title} subtitle={subtitle} />
        <main className="w-full max-w-full min-w-0 p-3 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
