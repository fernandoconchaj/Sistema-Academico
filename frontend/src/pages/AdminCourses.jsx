import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Edit3, Plus, Search, Trash2, UserMinus, UserPlus, X } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import Modal from '../components/Modal.jsx'
import { api, normalizeCourses } from '../api/client.js'

function emptyForm(){return {id:null,nombre:'',codigo:'',creditos:4,categoria:'',ciclo:'2026-1',aula:'',horario:'Lunes 08:00 - 10:00',color:'blue',modalidad:'Virtual 24/7',docenteId:'',estudianteIds:[],descripcion:''}}
function fullName(u){return `${u?.nombres||''} ${u?.apellidos||''}`.trim()}
function selectedStudents(inscripciones, cursoId){return inscripciones.filter(i=>i.curso?.id===cursoId).map(i=>i.estudiante?.id).filter(Boolean)}

export default function AdminCourses() {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(emptyForm())
  const [list, setList] = useState([])
  const [users, setUsers] = useState([])
  const [inscripciones, setInscripciones] = useState([])
  const [message, setMessage] = useState('Cargando cursos...')
  const [query, setQuery] = useState('')

  async function load() {
    const data = await api('/api/admin/dashboard')
    setList(normalizeCourses(data.cursos || []))
    setUsers(data.usuarios || [])
    setInscripciones(data.inscripciones || [])
    setMessage('Datos cargados correctamente')
  }
  useEffect(() => { load().catch(e => setMessage(e.message)) }, [])

  const docentes = users.filter(u => u.rol === 'DOCENTE' && u.estado === 'Activo')
  const estudiantes = users.filter(u => u.rol === 'ESTUDIANTE' && u.estado === 'Activo')
  const filtered = useMemo(() => list.filter(c => `${c.codigo} ${c.nombre} ${c.docente} ${c.modalidad}`.toLowerCase().includes(query.toLowerCase())), [list, query])

  function openCreate(){ setForm({...emptyForm(), docenteId: docentes[0]?.id || ''}); setModal(true) }
  function openEdit(c){ setForm({
    id:c.id,nombre:c.nombre||'',codigo:c.codigo||'',creditos:c.creditos||4,categoria:c.categoria||'',ciclo:c.ciclo||'2026-1',aula:c.aula||'',horario:c.horario||'',color:(c.color||'blue').includes('green')?'green':(c.color||'blue').includes('orange')?'orange':(c.color||'blue').includes('purple')?'purple':'blue',modalidad:c.modalidad||'Virtual 24/7',docenteId:c.docente?.id || users.find(u=>`${u.nombres} ${u.apellidos}`.trim()===c.docente)?.id || '',estudianteIds:selectedStudents(inscripciones,c.id),descripcion:c.descripcion||''
  }); setModal(true) }
  function toggleEstudiante(id){ setForm(f=>({ ...f, estudianteIds: f.estudianteIds.includes(id) ? f.estudianteIds.filter(x=>x!==id) : [...f.estudianteIds,id] })) }

  async function save(e) {
    e.preventDefault()
    const payload = {...form, docenteId:Number(form.docenteId), creditos:Number(form.creditos), estudianteIds:form.estudianteIds.map(Number)}
    const path = form.id ? `/api/admin/cursos/${form.id}` : '/api/admin/cursos'
    await api(path, { method: form.id ? 'PUT':'POST', body: JSON.stringify(payload) })
    setModal(false)
    setMessage(form.id ? 'Curso actualizado: docente, horario, salon y matriculas sincronizadas.' : 'Curso creado correctamente.')
    await load()
  }
  async function eliminar(c){ if(!confirm(`Eliminar el curso ${c.nombre}? Tambien se quitaran sus matriculas.`)) return; await api(`/api/admin/cursos/${c.id}`, {method:'DELETE'}); await load() }
  async function quitar(inscripcionId){ await api(`/api/admin/inscripciones/${inscripcionId}`, {method:'DELETE'}); await load() }
  async function matricular(cursoId, estudianteId){ if(!estudianteId) return; await api('/api/admin/inscripciones', { method:'POST', body:JSON.stringify({cursoId, estudianteId:Number(estudianteId)})}); await load() }

  return <DashboardLayout role="ADMIN" title="Gestion de cursos" subtitle="Crea cursos, asigna docentes, matricula o retira estudiantes y controla horarios reales">
    <section className="rounded-3xl bg-white border border-slate-100 p-5 shadow-card mb-7 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
      <div className="relative flex-1"><Search className="absolute left-4 top-3.5 text-slate-400" size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" placeholder="Buscar curso por nombre, codigo, docente o modalidad"/></div>
      <button onClick={openCreate} className="rounded-2xl bg-blue-600 text-white px-5 py-3 font-black flex items-center justify-center gap-2"><Plus size={18}/>Crear curso</button>
    </section>
    <div className="mb-5 rounded-2xl bg-blue-50 border border-blue-100 px-5 py-3 text-sm font-bold text-blue-700">{message}</div>

    <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{filtered.map(c=>{
      const ins = inscripciones.filter(i=>i.curso?.id===c.id)
      const disponibles = estudiantes.filter(e=>!ins.some(i=>i.estudiante?.id===e.id))
      return <article key={c.id} className="rounded-3xl bg-white border border-slate-100 overflow-hidden shadow-card">
        <div className={`h-28 bg-gradient-to-br ${c.color||'from-blue-600 to-indigo-700'} p-5 text-white`}><p className="text-xs font-black opacity-80">{c.codigo}</p><h3 className="text-xl font-black mt-2">{c.nombre}</h3></div>
        <div className="p-5"><p className="text-sm text-slate-500 min-h-[48px]">{c.descripcion}</p>
          <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-3 text-sm"><p><b>Docente:</b> {c.docente}</p><p><b>Horario:</b> {c.horario || 'Sin horario'}</p><p><b>Salon:</b> {c.aula || 'Sin aula'}</p><p><b>Matriculados:</b> {ins.length}</p></div>
          <div className="mt-4 space-y-2"><p className="text-xs font-black text-slate-500 uppercase">Estudiantes matriculados</p>{ins.length===0?<p className="text-sm text-slate-400">Sin estudiantes.</p>:ins.map(i=><div key={i.id} className="flex items-center justify-between gap-2 rounded-xl bg-blue-50 px-3 py-2"><span className="text-sm font-bold text-slate-700">{fullName(i.estudiante)}</span><button onClick={()=>quitar(i.id)} className="text-red-600 font-black text-xs flex gap-1 items-center"><UserMinus size={14}/>Quitar</button></div>)}</div>
          <select onChange={e=>matricular(c.id,e.target.value)} value="" className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"><option value="">Agregar estudiante existente</option>{disponibles.map(e=><option key={e.id} value={e.id}>{fullName(e)} - {e.correo}</option>)}</select>
          <div className="mt-5 grid grid-cols-2 gap-3"><button onClick={()=>openEdit(c)} className="rounded-xl bg-slate-900 text-white py-2.5 font-black flex items-center justify-center gap-2"><Edit3 size={16}/>Editar</button><button onClick={()=>eliminar(c)} className="rounded-xl bg-red-50 text-red-700 py-2.5 font-black flex items-center justify-center gap-2"><Trash2 size={16}/>Eliminar</button></div>
        </div>
      </article>})}</section>

    {modal && <Modal title={form.id?'Editar curso, docente y matriculas':'Crear curso y asignar estudiantes'} onClose={()=>setModal(false)}><form onSubmit={save} className="space-y-5">
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4"><p className="font-black text-blue-900">Datos academicos del curso</p><p className="text-sm text-blue-700">Todo lo que guardes se refleja en docente, estudiante, horarios y reportes.</p></div>
      <div className="grid sm:grid-cols-2 gap-4"><Input value={form.nombre} onChange={v=>setForm({...form,nombre:v})} label="Nombre del curso"/><Input value={form.codigo} onChange={v=>setForm({...form,codigo:v})} label="Codigo"/><Input value={form.creditos} onChange={v=>setForm({...form,creditos:v})} label="Creditos" type="number"/><Input value={form.categoria} onChange={v=>setForm({...form,categoria:v})} label="Categoria"/><Input value={form.ciclo} onChange={v=>setForm({...form,ciclo:v})} label="Ciclo"/><Input value={form.aula} onChange={v=>setForm({...form,aula:v})} label="Salon, aula o laboratorio"/><Input value={form.horario} onChange={v=>setForm({...form,horario:v})} label="Horario"/><Select label="Color" value={form.color} onChange={v=>setForm({...form,color:v})} options={[['blue','Azul'],['green','Verde'],['orange','Naranja'],['purple','Morado']]}/><Select label="Modalidad" value={form.modalidad} onChange={v=>setForm({...form,modalidad:v})} options={[['Virtual 24/7','Virtual 24/7'],['Virtual','Virtual'],['Presencial','Presencial']]}/><Select label="Docente responsable" value={form.docenteId} onChange={v=>setForm({...form,docenteId:v})} options={docentes.map(d=>[d.id,`${fullName(d)} - ${d.correo}`])}/></div>
      <div><label className="form-label">Descripcion</label><textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} className="input min-h-[110px]" required/></div>
      <div><p className="form-label">Matricular estudiantes</p><div className="grid sm:grid-cols-2 gap-2 max-h-56 overflow-auto rounded-2xl border border-slate-200 p-3">{estudiantes.map(e=><label key={e.id} className={`rounded-xl border px-3 py-3 cursor-pointer ${form.estudianteIds.includes(e.id)?'bg-blue-50 border-blue-200':'bg-white border-slate-100'}`}><input type="checkbox" checked={form.estudianteIds.includes(e.id)} onChange={()=>toggleEstudiante(e.id)} className="mr-2"/><span className="font-black text-slate-800">{fullName(e)}</span><span className="block text-xs text-slate-500 ml-6">{e.correo}</span></label>)}</div></div>
      <button className="w-full rounded-2xl bg-blue-600 text-white py-4 font-black flex items-center justify-center gap-2"><BookOpen size={18}/>{form.id?'Guardar cambios':'Crear curso y guardar matriculas'}</button>
    </form></Modal>}
  </DashboardLayout>
}
function Input({label,value,onChange,type='text'}){return <label className="block"><span className="form-label">{label}</span><input value={value} onChange={e=>onChange(e.target.value)} type={type} required className="input"/></label>}
function Select({label,value,onChange,options}){return <label className="block"><span className="form-label">{label}</span><select value={value} onChange={e=>onChange(e.target.value)} required className="input">{options.map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>}
