import { useEffect, useMemo, useState } from 'react'
import { Plus, Search, ShieldCheck, UserCheck, UserX, Trash2, Pencil, RefreshCw } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import Modal from '../components/Modal.jsx'
import { api } from '../api/client.js'

const emptyForm = { nombres:'', apellidos:'', correo:'', password:'', rol:'ESTUDIANTE', especialidad:'' }

export default function AdminUsers() {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('TODOS')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [list, setList] = useState([])
  const [message, setMessage] = useState('Cargando usuarios...')
  const [busyId, setBusyId] = useState(null)

  async function load() {
    const data = await api('/api/admin/dashboard')
    setList(data.usuarios || [])
    setMessage('Usuarios cargados correctamente')
  }

  useEffect(() => { load().catch(e => setMessage(e.message)) }, [])

  const filtered = useMemo(() => list.filter(u => {
    const text = `${u.nombres} ${u.apellidos} ${u.correo} ${u.rol}`.toLowerCase()
    return text.includes(query.toLowerCase()) && (role === 'TODOS' || u.rol === role)
  }), [query, role, list])

  function openCreate() {
    setForm(emptyForm)
    setModal({ type: 'crear' })
  }

  function openEdit(user) {
    setForm({
      nombres: user.nombres || '',
      apellidos: user.apellidos || '',
      correo: user.correo || '',
      password: '',
      rol: user.rol || 'ESTUDIANTE',
      especialidad: user.especialidad || ''
    })
    setModal({ type: 'editar', user })
  }

  function change(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })) }

  async function saveUser(e) {
    e.preventDefault()
    const payload = { ...form }
    if (!payload.password) delete payload.password
    const isEdit = modal?.type === 'editar'
    const path = isEdit ? `/api/admin/usuarios/${modal.user.id}` : '/api/admin/usuarios'
    const method = isEdit ? 'PUT' : 'POST'
    await api(path, { method, body: JSON.stringify(payload) })
    setModal(null)
    setMessage(isEdit ? 'Usuario editado correctamente' : 'Usuario creado correctamente')
    await load()
  }

  async function toggle(user) {
    setBusyId(user.id)
    const nuevoEstado = user.estado === 'Activo' ? 'Inactivo' : 'Activo'
    try {
      try {
        await api(`/api/admin/usuarios/${user.id}/estado`, { method: 'PATCH' })
      } catch (err) {
        await api(`/api/admin/usuarios/${user.id}/estado`, { method: 'PUT' })
      }
      setList(prev => prev.map(item => item.id === user.id ? { ...item, estado: nuevoEstado } : item))
      setMessage(`${user.nombres} ahora esta ${nuevoEstado.toLowerCase()}`)
      await load()
    } catch (e) {
      alert(e.message || 'No se pudo cambiar el estado del usuario')
    } finally { setBusyId(null) }
  }

  async function remove(user) {
    if (!confirm(`¿Eliminar a ${user.nombres} ${user.apellidos}? Esta accion retirara sus registros asociados.`)) return
    setBusyId(user.id)
    try {
      await api(`/api/admin/usuarios/${user.id}`, { method: 'DELETE' })
      setMessage('Usuario eliminado correctamente')
      await load()
    } catch (e) {
      alert(e.message)
    } finally { setBusyId(null) }
  }

  return <DashboardLayout role="ADMIN" title="Gestion de usuarios" subtitle="Administra estudiantes, docentes y administradores">
    <section className="rounded-3xl bg-white border border-slate-100 p-5 shadow-card mb-7 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
      <div className="flex flex-col md:flex-row gap-3 flex-1">
        <div className="relative flex-1"><Search className="absolute left-4 top-3.5 text-slate-400" size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" placeholder="Buscar por nombre, correo o rol"/></div>
        <select value={role} onChange={e=>setRole(e.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 font-bold text-slate-700"><option>TODOS</option><option>ADMIN</option><option>DOCENTE</option><option>ESTUDIANTE</option></select>
      </div>
      <button onClick={openCreate} className="rounded-2xl bg-blue-600 text-white px-5 py-3 font-black flex items-center justify-center gap-2"><Plus size={18}/>Crear usuario</button>
    </section>

    <div className="mb-5 rounded-2xl bg-blue-50 border border-blue-100 px-5 py-3 text-sm font-bold text-blue-700 flex items-center gap-2"><RefreshCw size={16}/>{message}</div>

    <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
      {filtered.map(u => { const nombreVisible = `${u.nombres || ''} ${u.apellidos || ''}`.replace('Administrador UTA', 'Administrador General').trim(); return <article key={u.id} className="rounded-3xl bg-white border border-slate-100 p-6 shadow-card hover:-translate-y-1 transition">
        <div className="flex items-start justify-between gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">{u.nombres?.[0]}{u.apellidos?.[0]}</div>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${u.estado==='Activo'?'bg-emerald-50 text-emerald-700':'bg-red-50 text-red-700'}`}>{u.estado}</span>
        </div>
        <h3 className="font-black text-slate-900 mt-4">{nombreVisible}</h3>
        <p className="text-sm text-slate-500 mt-1">{u.correo}</p>
        <p className="text-xs text-slate-400 mt-1">{u.especialidad || 'Sin especialidad registrada'}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{u.rol}</span></div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button disabled={busyId===u.id} onClick={()=>openEdit(u)} className="rounded-xl bg-slate-900 text-white py-2.5 font-black flex items-center justify-center gap-2"><Pencil size={15}/>Editar</button>
          <button disabled={busyId===u.id} onClick={()=>toggle(u)} className="rounded-xl bg-slate-100 text-slate-800 py-2.5 font-black flex items-center justify-center gap-2">{u.estado==='Activo'?<UserX size={16}/>:<UserCheck size={16}/>} {u.estado==='Activo'?'Desactivar':'Activar'}</button>
          <button disabled={busyId===u.id} onClick={()=>remove(u)} className="rounded-xl bg-red-50 text-red-700 py-2.5 font-black flex items-center justify-center gap-2"><Trash2 size={16}/>Eliminar</button>
        </div>
      </article>})}
    </section>

    {modal && <Modal title={modal.type === 'editar' ? 'Editar usuario' : 'Crear nuevo usuario'} onClose={()=>setModal(null)}>
      <form onSubmit={saveUser} className="grid sm:grid-cols-2 gap-4">
        <Input name="nombres" label="Nombres" value={form.nombres} onChange={change}/>
        <Input name="apellidos" label="Apellidos" value={form.apellidos} onChange={change}/>
        <Input name="correo" label="Correo" type="email" value={form.correo} onChange={change}/>
        <Input name="password" label={modal.type === 'editar' ? 'Nueva contraseña opcional' : 'Contraseña'} type="password" value={form.password} onChange={change} required={modal.type !== 'editar'}/>
        <Input name="especialidad" label="Especialidad, carrera o area" value={form.especialidad} onChange={change}/>
        <label className="block"><span className="text-sm font-black text-slate-700">Rol</span><select name="rol" value={form.rol} onChange={change} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"><option>ESTUDIANTE</option><option>DOCENTE</option><option>ADMIN</option></select></label>
        <button className="sm:col-span-2 rounded-2xl bg-blue-600 text-white py-3.5 font-black flex items-center justify-center gap-2"><ShieldCheck size={18}/>{modal.type === 'editar' ? 'Guardar cambios' : 'Guardar usuario'}</button>
      </form>
    </Modal>}
  </DashboardLayout>
}
function Input({label, name, type='text', value, onChange, required=true}) { return <label className="block"><span className="text-sm font-black text-slate-700">{label}</span><input name={name} type={type} value={value} onChange={onChange} required={required} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100"/></label> }
