import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { register, saveSession } from '../api/client.js'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombres: '', apellidos: '', correo: '', password: '', rol: 'ESTUDIANTE', especialidad: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await register(form)
      saveSession(user)
      navigate(user.rol === 'DOCENTE' ? '/docente' : '/estudiante')
    } catch (err) {
      setError(err.message || 'No se pudo registrar el usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8 sm:py-10 overflow-x-hidden">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-[1.75rem] sm:rounded-[2rem] bg-white p-6 sm:p-10 shadow-soft">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-2xl bg-blue-600 text-white flex items-center justify-center"><GraduationCap /></div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Crear cuenta</h1>
            <p className="text-sm sm:text-base text-slate-500">Completa tus datos para acceder a la plataforma.</p>
          </div>
        </div>
        {error && <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Nombres" value={form.nombres} onChange={e => setForm({...form, nombres: e.target.value})} />
          <Input label="Apellidos" value={form.apellidos} onChange={e => setForm({...form, apellidos: e.target.value})} />
          <Input label="Correo" type="email" value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
          <Input label="Contrasena" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <label className="sm:col-span-2 block">
            <span className="text-sm font-black text-slate-700">Tipo de cuenta</span>
            <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100">
              <option value="ESTUDIANTE">Estudiante</option>
              <option value="DOCENTE">Docente</option>
            </select>
          </label>
          {form.rol === 'DOCENTE' && <Input label="Especialidad" value={form.especialidad} onChange={e => setForm({...form, especialidad: e.target.value})} />}
        </div>
        <button disabled={loading} className="mt-7 w-full rounded-2xl bg-blue-600 py-3.5 font-black text-white hover:bg-blue-700 transition disabled:opacity-60">{loading ? 'Creando cuenta...' : 'Crear cuenta'}</button>
        <Link to="/login" className="mt-5 block text-center font-black text-blue-700">Ya tengo cuenta</Link>
      </form>
    </div>
  )
}

function Input({ label, ...props }) {
  return <label className="block"><span className="text-sm font-black text-slate-700">{label}</span><input {...props} required className="mt-2 w-full min-w-0 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" /></label>
}
