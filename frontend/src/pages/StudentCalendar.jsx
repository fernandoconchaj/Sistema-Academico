import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList, BookOpen, Video, MapPin, Clock, CalendarDays } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { api, normalizeCourses } from '../api/client.js'

const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']

function parseSchedule(curso, index) {
  const raw = curso.horario || 'Lunes 08:00 - 10:00'
  const lower = raw.toLowerCase()
  const dayIndex = days.findIndex(d => lower.includes(d.toLowerCase()))
  const match = raw.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
  const start = match?.[1] || `${8 + index}:00`
  const end = match?.[2] || `${10 + index}:00`
  const hour = Number(start.split(':')[0])
  return {
    day: dayIndex >= 0 ? dayIndex : index % 6,
    dayName: days[dayIndex >= 0 ? dayIndex : index % 6],
    top: Math.max(0, hour - 8),
    span: 2,
    title: curso.nombre,
    time: `${start} - ${end}`,
    type: curso.modalidad,
    aula: curso.aula,
    color: ['bg-blue-600','bg-emerald-600','bg-rose-600','bg-purple-600','bg-orange-600'][index % 5]
  }
}

export default function StudentCalendar() {
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { api('/api/estudiante/dashboard').then(res => setCourses(normalizeCourses(res.cursos || []))).catch(e => setError(e.message)) }, [])
  const events = courses.map(parseSchedule)
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

  return <DashboardLayout role="ESTUDIANTE" title="Calendario academico" subtitle="Horario semanal de tus cursos matriculados">
    {error && <div className="rounded-3xl bg-red-50 border border-red-200 p-5 text-red-700 font-black mb-6">{error}</div>}

    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <div className="min-w-0">
        <p className="text-sm font-bold text-blue-700">2026 - Ciclo 1 Marzo</p>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Semana actual: cursos matriculados</h2>
      </div>
      <div className="flex gap-2 shrink-0">
        <button className="rounded-2xl border bg-white px-4 py-3 font-black text-slate-700 hover:bg-slate-50">Hoy</button>
        <button className="rounded-2xl bg-blue-600 px-4 py-3 text-white"><ChevronLeft /></button>
        <button className="rounded-2xl bg-blue-600 px-4 py-3 text-white"><ChevronRight /></button>
      </div>
    </div>

    <section className="md:hidden space-y-4">
      {events.length === 0 && <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-card text-slate-500 font-bold">Aun no tienes horarios registrados.</div>}
      {events.map((e, i) => <article key={i} className="rounded-3xl bg-white border border-slate-100 p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 shrink-0 rounded-2xl ${e.color} text-white flex items-center justify-center`}><CalendarDays size={22}/></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black text-blue-700 uppercase">{e.dayName}</p>
            <h3 className="mt-1 font-black text-slate-900 leading-tight break-words">{e.title}</h3>
            <p className="mt-2 text-sm text-slate-600 flex items-center gap-2"><Clock size={16}/>{e.time}</p>
            <p className="mt-1 text-sm text-slate-600 flex items-center gap-2"><MapPin size={16}/>{e.aula || 'Aula virtual'}</p>
            <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{e.type}</span>
          </div>
        </div>
      </article>)}
    </section>

    <section className="hidden md:block rounded-[2rem] bg-white border border-slate-100 shadow-card overflow-x-auto scrollbar-soft">
      <div className="min-w-[860px]">
        <div className="grid grid-cols-[90px_repeat(6,1fr)] border-b bg-slate-50">
          <div className="p-4 text-sm font-black text-slate-500">Hora</div>
          {days.map(day => <div key={day} className="p-4 text-center text-sm font-black text-slate-700 border-l">{day}</div>)}
        </div>
        <div className="relative grid grid-cols-[90px_repeat(6,1fr)]">
          <div className="divide-y">{hours.map(h => <div key={h} className="h-24 p-3 text-xs font-bold text-slate-400">{h}</div>)}</div>
          {days.map((day, idx) => <div key={day} className="relative border-l divide-y">
            {hours.map(h => <div key={h} className="h-24" />)}
            {events.filter(e => e.day === idx).map((e, i) => <div key={i} className={`absolute left-2 right-2 rounded-2xl ${e.color} text-white p-3 shadow-lg overflow-hidden`} style={{ top: `${e.top * 96 + 8}px`, height: `${e.span * 96 - 12}px` }}>
              <p className="text-xs font-black leading-tight line-clamp-2">{e.title}</p>
              <p className="text-[11px] mt-2 opacity-90 flex items-center gap-1"><Clock size={12}/>{e.time}</p>
              <span className="mt-2 inline-block rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold">{e.type}</span>
              <p className="text-[11px] mt-2 flex items-center gap-1 truncate"><MapPin size={12}/>{e.aula || 'Aula virtual'}</p>
            </div>)}
          </div>)}
        </div>
      </div>
    </section>

    <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
      <MiniCard icon={BookOpen} title="Cursos en horario" value={`${courses.length} cursos`} />
      <MiniCard icon={ClipboardList} title="Tareas próximas" value="Segun tus cursos" />
      <MiniCard icon={Video} title="Clases virtuales" value="Programadas" />
    </section>
  </DashboardLayout>
}

function MiniCard({ icon: Icon, title, value }) {
  return <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-card flex items-center gap-4 min-w-0"><div className="h-12 w-12 shrink-0 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center"><Icon /></div><div className="min-w-0"><p className="font-black text-slate-900 break-words">{title}</p><p className="text-sm text-slate-500">{value}</p></div></div>
}
