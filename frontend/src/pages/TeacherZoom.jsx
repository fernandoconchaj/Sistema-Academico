import { useEffect, useState } from 'react'
import { ExternalLink, Plus, Video, X } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { api, normalizeCourses } from '../api/client.js'

export default function TeacherZoom() {
  const [courses, setCourses] = useState([])
  const [zooms, setZooms] = useState([])
  const [modal, setModal] = useState(null)
  const [message, setMessage] = useState('Cargando clases Zoom reales...')
  const [form, setForm] = useState({ titulo:'', cursoId:'', fecha:'', hora:'19:00', enlace:'', grabacion:'' })

  async function load() {
    const dash = await api('/api/docente/dashboard')
    const cs = normalizeCourses(dash.cursos || [])
    setCourses(cs)
    setForm(f => ({...f, cursoId: f.cursoId || cs[0]?.id || ''}))
    const all = []
    for (const c of cs) {
      const detail = await api(`/api/docente/cursos/${c.id}`)
      ;(detail.zoom || []).forEach(z => all.push({...z, curso: c}))
    }
    setZooms(all)
    setMessage('Solo se muestran clases Zoom de tus cursos')
  }
  useEffect(() => { load().catch(e => setMessage(e.message)) }, [])

  async function save(e) {
    e.preventDefault()
    await api('/api/docente/zoom', { method:'POST', body: JSON.stringify({ ...form, cursoId:Number(form.cursoId) }) })
    setModal(null)
    setMessage('Clase Zoom registrada y visible para estudiantes matriculados')
    await load()
  }

  return <DashboardLayout role="DOCENTE" title="Clases Zoom" subtitle="Programa enlaces en vivo y grabaciones para tus cursos">
    <section className="rounded-3xl bg-white border border-slate-100 p-5 shadow-card mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"><div><h3 className="font-black text-slate-900">Mis salas Zoom</h3><p className="text-sm text-slate-500 mt-1">{message}</p></div><button onClick={() => setModal('crear')} className="rounded-2xl bg-slate-900 text-white px-5 py-3 font-black hover:bg-blue-700 flex items-center justify-center gap-2"><Plus size={18}/> Subir Zoom</button></section>
    <div className="rounded-3xl bg-white border border-slate-100 shadow-card overflow-hidden"><div className="p-6 border-b border-slate-100 flex items-center justify-between"><h2 className="text-xl font-black text-slate-900">Programacion de Zoom</h2><Video className="text-blue-600" /></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4 text-left">Curso</th><th className="p-4 text-left">Clase</th><th className="p-4 text-left">Fecha y hora</th><th className="p-4 text-left">Acciones</th></tr></thead><tbody>{zooms.length === 0 ? <tr><td colSpan="4" className="p-6 text-center text-slate-500 font-bold">No tienes clases Zoom registradas.</td></tr> : zooms.map(z => <tr key={z.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="p-4 font-black text-slate-900">{z.curso?.nombre}</td><td className="p-4 text-slate-700">{z.titulo}</td><td className="p-4 text-slate-600">{z.fecha} • {z.hora}</td><td className="p-4"><div className="flex gap-2"><a href={z.enlace || '#'} target="_blank" rel="noreferrer" className="rounded-xl bg-blue-600 text-white px-3 py-2 font-black flex items-center gap-2"><ExternalLink size={16}/> Abrir</a><button onClick={()=>setModal('crear')} className="rounded-xl bg-slate-100 text-slate-700 px-3 py-2 font-black">Agregar otro</button></div></td></tr>)}</tbody></table></div></div>
    {modal && <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl"><div className="flex items-center justify-between mb-5"><h2 className="text-xl font-black text-slate-900">Subir clase Zoom</h2><button onClick={()=>setModal(null)} className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center"><X size={18}/></button></div><form onSubmit={save} className="space-y-4"><Input label="Titulo de clase" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/><Select label="Curso" value={form.cursoId} onChange={e=>setForm({...form,cursoId:e.target.value})} options={courses}/><Input label="Fecha" type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/><Input label="Hora" type="time" value={form.hora} onChange={e=>setForm({...form,hora:e.target.value})}/><Input label="Enlace Zoom" value={form.enlace} onChange={e=>setForm({...form,enlace:e.target.value})}/><Input label="Enlace de grabacion" value={form.grabacion} onChange={e=>setForm({...form,grabacion:e.target.value})}/><button className="w-full rounded-2xl bg-blue-600 text-white py-3 font-black">Guardar clase Zoom</button></form></div></div>}
  </DashboardLayout>
}
function Input({ label, type='text', ...props }) { return <label className="block"><span className="text-sm font-black text-slate-700">{label}</span><input type={type} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" {...props}/></label> }
function Select({ label, options, ...props }) { return <label className="block"><span className="text-sm font-black text-slate-700">{label}</span><select required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" {...props}>{options.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label> }
