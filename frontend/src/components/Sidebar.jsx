import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, CalendarDays, ChartBar, FileText, GraduationCap, HelpCircle, Home, LogOut, MessageCircle, Settings, Users, Video } from 'lucide-react'

const menuByRole = {
  ESTUDIANTE: [
    { label: 'Inicio', icon: Home, path: '/estudiante' },
    { label: 'Mis cursos', icon: BookOpen, path: '/estudiante' },
    { label: 'Calendario', icon: CalendarDays, path: '/estudiante/calendario' },
    { label: 'Chat', icon: MessageCircle, path: '/estudiante/chat' },
    { label: 'Reportes', icon: FileText, path: '/estudiante/reportes' },
    { label: 'Ayuda', icon: HelpCircle, path: '/estudiante/ayuda' }
  ],
  DOCENTE: [
    { label: 'Inicio', icon: Home, path: '/docente' },
    { label: 'Cursos dictados', icon: BookOpen, path: '/docente' },
    { label: 'Horario y salones', icon: CalendarDays, path: '/docente/horario' },
    { label: 'Chat', icon: MessageCircle, path: '/docente/chat' },
    { label: 'Reportes', icon: ChartBar, path: '/docente/reportes' },
    { label: 'Evaluaciones', icon: FileText, path: '/docente/evaluaciones' },
    { label: 'Zoom', icon: Video, path: '/docente/zoom' },
    { label: 'Configuracion', icon: Settings, path: '/docente/configuracion' }
  ],
  ADMIN: [
    { label: 'Panel', icon: Home, path: '/admin' },
    { label: 'Usuarios', icon: Users, path: '/admin/usuarios' },
    { label: 'Cursos', icon: BookOpen, path: '/admin/cursos' },
    { label: 'Reportes', icon: ChartBar, path: '/admin/reportes' },
    { label: 'Configuracion', icon: Settings, path: '/admin/configuracion' }
  ]
}

export default function Sidebar({ role }) {
  const location = useLocation()
  const navigate = useNavigate()
  const menu = menuByRole[role] || menuByRole.ESTUDIANTE

  function logout() {
    localStorage.removeItem('sau_user')
    localStorage.removeItem('sau_token')
    navigate('/login')
  }

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 flex-col bg-slate-950 text-white p-5">
      <div className="flex items-center gap-3 px-3 py-4">
        <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
          <GraduationCap size={27} />
        </div>
        <div>
          <h1 className="text-lg font-black leading-tight break-words">Sistema Académico Universitario</h1>
          <p className="text-xs text-slate-400">Aula virtual academica</p>
        </div>
      </div>

      <nav className="mt-7 space-y-2 flex-1">
        {menu.map((item) => {
          const Icon = item.icon
          const active = location.pathname === item.path
          return (
            <Link key={item.label} to={item.path} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={20} /> {item.label}
            </Link>
          )
        })}
      </nav>

      <button onClick={logout} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-red-500/15 hover:text-red-200 transition">
        <LogOut size={20} /> Cerrar sesion
      </button>
    </aside>
  )
}
