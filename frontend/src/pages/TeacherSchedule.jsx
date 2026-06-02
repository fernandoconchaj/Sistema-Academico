import { useEffect, useState } from 'react'
import { CalendarDays, Clock, DoorOpen, MapPin, Video } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { api } from '../api/client.js'

const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado']

function normalizeSchedule(item, index) {
  const raw = item.horario || 'Lunes 08:00 - 10:00'
  const day = days.find(d => raw.toLowerCase().includes(d.toLowerCase())) || days[index % days.length]
  const match = raw.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
  return { id:index+1, dia:day, horaInicio:match?.[1] || '08:00', horaFin:match?.[2] || '10:00', curso:item.curso, salon:item.aula || 'Aula virtual', sede:item.modalidad?.includes('Virtual') ? 'Campus virtual' : 'Sede Arequipa', modalidad:item.modalidad }
}

export default function TeacherSchedule() {
  const [schedule, setSchedule] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { api('/api/docente/dashboard').then(res => setSchedule((res.horario || []).map(normalizeSchedule))).catch(e => setError(e.message)) }, [])
  return <DashboardLayout role="DOCENTE" title="Horario docente" subtitle="Consulta tus clases, modalidad, sede y salon asignado">
    {error && <div className="rounded-3xl bg-red-50 border border-red-200 p-5 text-red-700 font-black mb-6">{error}</div>}
    <section className="grid lg:grid-cols-3 gap-5 mb-8"><div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 shadow-soft"><p className="text-sm font-black uppercase text-white/70">Semana actual</p><h1 className="text-3xl font-black mt-2">Clases programadas por salon</h1><p className="mt-3 text-white/80">Los horarios salen de los cursos asignados al docente en la base de datos.</p></div><div className="rounded-3xl bg-white p-6 shadow-card border border-slate-100"><p className="text-sm text-slate-500 font-bold">Total de clases</p><p className="text-5xl font-black text-slate-900 mt-2">{schedule.length}</p><p className="text-sm text-slate-500 mt-2">Presenciales y virtuales</p></div></section>
    <section className="grid xl:grid-cols-6 md:grid-cols-3 sm:grid-cols-2 gap-4 mb-8">{days.map(day => { const items = schedule.filter(h => h.dia === day); return <div key={day} className="rounded-3xl bg-white border border-slate-100 shadow-card p-4 min-h-48"><h3 className="font-black text-slate-900 border-b border-slate-100 pb-3">{day}</h3><div className="mt-4 space-y-3">{items.length ? items.map(item => <MiniClass key={item.id} item={item} />) : <p className="text-sm text-slate-400 font-bold">Sin clases</p>}</div></div> })}</section>
    <section className="rounded-3xl bg-white border border-slate-100 shadow-card overflow-hidden"><div className="p-6 border-b border-slate-100"><h2 className="text-xl font-black text-slate-900">Detalle de horario</h2><p className="text-sm text-slate-500 mt-1">Listado completo con aula, sede y modalidad.</p></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="text-left p-4">Dia</th><th className="text-left p-4">Hora</th><th className="text-left p-4">Curso</th><th className="text-left p-4">Salon</th><th className="text-left p-4">Sede</th><th className="text-left p-4">Modalidad</th></tr></thead><tbody>{schedule.map(item => <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="p-4 font-black text-slate-900">{item.dia}</td><td className="p-4 text-slate-600">{item.horaInicio} - {item.horaFin}</td><td className="p-4 font-bold text-slate-700">{item.curso}</td><td className="p-4"><span className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 font-black"><DoorOpen size={16}/>{item.salon}</span></td><td className="p-4 text-slate-600">{item.sede}</td><td className="p-4"><span className="rounded-full bg-slate-100 px-3 py-1 font-black text-slate-700">{item.modalidad}</span></td></tr>)}</tbody></table></div></section>
  </DashboardLayout>
}
function MiniClass({ item }) { const virtual = item.modalidad?.toLowerCase().includes('virtual'); return <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100"><div className="flex items-center gap-2 text-xs font-black text-blue-700"><Clock size={14}/>{item.horaInicio} - {item.horaFin}</div><p className="font-black text-slate-900 mt-2 text-sm leading-tight">{item.curso}</p><p className="text-xs text-slate-500 mt-2 flex items-center gap-1">{virtual ? <Video size={13}/> : <MapPin size={13}/>} {item.salon}</p></div> }
