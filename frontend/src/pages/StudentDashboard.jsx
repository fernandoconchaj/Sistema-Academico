import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, CalendarCheck, ClipboardList, Video } from 'lucide-react'
import CourseCard from '../components/CourseCard.jsx'
import StatCard from '../components/StatCard.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { api, normalizeCourses } from '../api/client.js'

export default function StudentDashboard() {
  const [data, setData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function load() {
    const [dash, notif] = await Promise.all([
      api('/api/estudiante/dashboard'),
      api('/api/estudiante/notificaciones')
    ])
    setData({ ...dash, cursos: normalizeCourses(dash.cursos || []) })
    setNotifications(notif || [])
  }

  useEffect(() => {
    load().catch(err => setError(err.message))
    const timer = setInterval(() => load().catch(() => {}), 10000)
    return () => clearInterval(timer)
  }, [])

  const courses = data?.cursos || []
  const actividades = notifications.filter(n => ['Tarea', 'Evaluacion', 'Zoom', 'Material'].includes(n.tipo)).slice(0, 4)
  const anuncios = notifications.filter(n => n.tipo === 'Anuncio').slice(0, 4)

  return (
    <DashboardLayout role="ESTUDIANTE" title="Mi aula virtual" subtitle="Cursos, actividades pendientes, evaluaciones y clases en vivo">
      {error && <Alert text={error} />}
      {!data && !error && <Loading />}
      {data && <>
        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          <StatCard icon={BookOpen} label="Cursos activos" value={courses.length} detail="Periodo 2026-1" />
          <StatCard icon={ClipboardList} label="Tareas pendientes" value={data.tareasPendientes || 0} tone="orange" />
          <StatCard icon={CalendarCheck} label="Evaluaciones" value={data.evaluaciones || 0} tone="purple" />
          <StatCard icon={Video} label="Clases Zoom" value={data.clasesZoom || 0} tone="green" />
        </section>

        <section className="grid xl:grid-cols-[1fr_380px] gap-7">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <div><h2 className="text-2xl font-black text-slate-900">Mis cursos</h2><p className="text-sm text-slate-500">Cursos asignados al estudiante.</p></div>
              <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"><option>Periodo 2026-1</option></select>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map(course => <CourseCard key={course.id} course={course} />)}
            </div>
          </div>

          <aside className="space-y-6">
            <NotificationBox title="Actividades semanales" items={actividades} empty="No hay actividades nuevas." onOpen={(n)=> n.path && navigate(n.path)} />
            <NotificationBox title="Anuncios recientes" items={anuncios} empty="No hay anuncios nuevos." onOpen={(n)=> n.path && navigate(n.path)} />
          </aside>
        </section>
      </>}
    </DashboardLayout>
  )
}

function NotificationBox({ title, items, empty, onOpen }) {
  return <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-card">
    <h3 className="font-black text-slate-900 mb-4">{title}</h3>
    <div className="space-y-3">
      {items.length === 0 && <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-500 font-bold">{empty}</div>}
      {items.map((item) => <button key={`${item.tipo}-${item.entidadId}-${item.id}`} onClick={() => onOpen(item)} className="w-full text-left rounded-2xl bg-slate-50 border border-slate-100 p-4 hover:bg-blue-50 hover:border-blue-200 transition">
        <div className="flex items-center justify-between gap-2"><span className="text-xs font-black text-blue-700 bg-blue-100 rounded-full px-3 py-1">{item.tipo}</span><span className="text-xs text-slate-400 font-bold">{item.fecha}</span></div>
        <p className="mt-3 text-sm font-black text-slate-900">{item.titulo}</p>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.mensaje}</p>
        <p className="mt-2 text-xs font-black text-blue-600">Ir a {item.tab || 'detalle'} →</p>
      </button>)}
    </div>
  </div>
}
function Loading(){ return <div className="rounded-3xl bg-white p-8 shadow-card font-black text-slate-500">Cargando informacion del estudiante...</div> }
function Alert({text}){ return <div className="rounded-3xl bg-red-50 border border-red-200 p-5 text-red-700 font-black mb-6">{text}</div> }
