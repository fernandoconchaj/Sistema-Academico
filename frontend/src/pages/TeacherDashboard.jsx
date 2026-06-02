import { useEffect, useState } from 'react'
import { BookOpen, CalendarDays, ClipboardList, Plus, Users, Video } from 'lucide-react'
import CourseCard from '../components/CourseCard.jsx'
import Modal from '../components/Modal.jsx'
import StatCard from '../components/StatCard.jsx'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { api, normalizeCourses } from '../api/client.js'

export default function TeacherDashboard() {
  const [modal, setModal] = useState(null)
  const [message, setMessage] = useState('Cargando panel docente...')
  const [data, setData] = useState(null)
  const [form, setForm] = useState({ titulo:'', descripcion:'', fecha:'', enlace:'', hora:'19:00', cursoId:'', archivoNombre:'', archivoTipo:'', archivoBase64:'', url:'' })

  async function load(){
    const res = await api('/api/docente/dashboard')
    const cursos = normalizeCourses(res.cursos || [])
    setData({ ...res, cursos })
    setForm(f => ({...f, cursoId: cursos[0]?.id || ''}))
    setMessage('Listo para gestionar tus cursos')
  }
  useEffect(() => { load().catch(e => setMessage(e.message)) }, [])

  const teacherCourses = data?.cursos || []

  async function save(e) {
    e.preventDefault()
    const payload = { ...form, cursoId: Number(form.cursoId), fechaLimite: form.fecha, duracionMinutos: 30, intentos: 1, puntaje: 20, mensaje: form.descripcion }
    if (modal === 'tarea') await api('/api/docente/tareas', { method:'POST', body: JSON.stringify(payload) })
    if (modal === 'evaluacion') await api('/api/docente/evaluaciones', { method:'POST', body: JSON.stringify(payload) })
    if (modal === 'zoom') await api('/api/docente/zoom', { method:'POST', body: JSON.stringify(payload) })
    setMessage(modal === 'tarea' ? 'Tarea creada correctamente en la base de datos' : modal === 'evaluacion' ? 'Evaluacion creada correctamente en la base de datos' : 'Clase Zoom subida correctamente en la base de datos')
    setModal(null)
    setForm({ titulo:'', descripcion:'', fecha:'', enlace:'', hora:'19:00', cursoId: teacherCourses[0]?.id || '', archivoNombre:'', archivoTipo:'', archivoBase64:'', url:'' })
    await load()
  }

  return <DashboardLayout role="DOCENTE" title="Panel docente" subtitle="Gestiona cursos dictados, tareas, evaluaciones y clases Zoom">
    <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
      <StatCard icon={BookOpen} label="Cursos dictados" value={teacherCourses.length} />
      <StatCard icon={ClipboardList} label="Tareas creadas" value={data?.tareas || 0} tone="orange" />
      <StatCard icon={Video} label="Clases Zoom" value={data?.zoom || 0} tone="green" />
      <StatCard icon={Users} label="Estudiantes" value="86" tone="purple" />
    </section>
    <div className="rounded-3xl bg-white border border-slate-100 p-5 shadow-card mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div><h3 className="font-black text-slate-900">Acciones rapidas</h3><p className="text-sm text-slate-500 mt-1">{message}</p></div>
      <div className="flex flex-col sm:flex-row gap-3"><Action onClick={() => setModal('tarea')} label="Crear tarea" /><Action onClick={() => setModal('evaluacion')} label="Crear evaluacion" /><Action onClick={() => setModal('zoom')} label="Subir Zoom" dark /></div>
    </div>
    <section className="rounded-3xl bg-white border border-slate-100 p-5 shadow-card mb-8"><div className="flex items-center justify-between gap-4 mb-4"><div><h3 className="font-black text-slate-900 flex items-center gap-2"><CalendarDays size={20}/> Horario y salones</h3><p className="text-sm text-slate-500 mt-1">Horario registrado para los cursos asignados.</p></div><a href="/docente/horario" className="rounded-2xl bg-blue-50 text-blue-700 px-4 py-3 font-black hover:bg-blue-600 hover:text-white transition">Ver horario completo</a></div><div className="grid md:grid-cols-3 gap-4">{(data?.horario || []).slice(0,3).map((h,i) => <div key={i} className="rounded-2xl bg-slate-50 border border-slate-100 p-4"><p className="text-xs font-black text-blue-700 uppercase">{h.horario}</p><p className="mt-2 font-black text-slate-900">{h.curso}</p><p className="mt-1 text-sm text-slate-500">Salon: <b>{h.aula}</b></p><p className="text-sm text-slate-500">{h.modalidad}</p></div>)}</div></section>
    <h2 className="text-2xl font-black text-slate-900 mb-5">Mis cursos asignados</h2><div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{teacherCourses.map(course => <CourseCard key={course.id} course={course} role="teacher" />)}</div>
    {modal && <Modal title={modal === 'tarea' ? 'Crear tarea' : modal === 'evaluacion' ? 'Crear evaluacion' : 'Subir clase Zoom'} onClose={() => setModal(null)}><form onSubmit={save} className="space-y-4"><Input label="Titulo" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/><label className="block"><span className="text-sm font-black text-slate-700">Curso</span><select value={form.cursoId} onChange={e=>setForm({...form,cursoId:e.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100">{teacherCourses.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label><label className="block"><span className="text-sm font-black text-slate-700">Descripcion o mensaje</span><textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} required rows="4" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" /></label><Input label="Fecha" type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/>{modal==='tarea' && <><label className="block"><span className="text-sm font-black text-slate-700">Documento de indicaciones PDF, Word o PPT</span><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*" onChange={async e=>{ const file=e.target.files?.[0]; if(!file)return; const base64=await fileToDataUrl(file); setForm({...form, archivoNombre:file.name, archivoTipo:file.type || 'application/octet-stream', archivoBase64:base64}) }} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />{form.archivoNombre && <p className="mt-2 text-sm font-bold text-blue-700">Archivo cargado: {form.archivoNombre}</p>}</label><Input label="URL opcional del archivo" value={form.url} onChange={e=>setForm({...form,url:e.target.value})}/></>}{modal==='zoom' && <><Input label="Hora" value={form.hora} onChange={e=>setForm({...form,hora:e.target.value})}/><Input label="Enlace Zoom" value={form.enlace} onChange={e=>setForm({...form,enlace:e.target.value})}/></>}<button className="w-full rounded-2xl bg-blue-600 py-3.5 text-white font-black hover:bg-blue-700 transition">Guardar</button></form></Modal>}
  </DashboardLayout>
}
function Action({ label, onClick, dark }) { return <button onClick={onClick} className={`rounded-2xl px-5 py-3 font-black flex items-center justify-center gap-2 transition ${dark ? 'bg-slate-900 text-white hover:bg-blue-700' : 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'}`}><Plus size={18} /> {label}</button> }
function Input({ label, type='text', ...props }) { return <label className="block"><span className="text-sm font-black text-slate-700">{label}</span><input type={type} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" {...props}/></label> }

function fileToDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file) }) }
