import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpenCheck, GraduationCap, Lock, Mail, ShieldCheck, Users } from 'lucide-react'
import { login, saveSession } from '../api/client.js'

export default function Login() {
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('estudiante@universidad.edu.pe')
  const [password, setPassword] = useState('12345')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(correo, password)
      saveSession(user)
      if (user.rol === 'ADMIN') navigate('/admin')
      else if (user.rol === 'DOCENTE') navigate('/docente')
      else navigate('/estudiante')
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesion. Revisa el correo y la contrasena.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-6 sm:py-10 overflow-x-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-28 -left-20 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[440px] lg:max-w-5xl grid lg:grid-cols-[0.95fr_1fr] rounded-[1.75rem] overflow-hidden bg-white shadow-soft">
        <section className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 to-indigo-900 p-10 text-white">
          <div>
            <div className="flex items-center gap-3 mb-9">
              <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center"><GraduationCap /></div>
              <div>
                <h1 className="text-2xl font-black leading-tight">Sistema Académico Universitario</h1>
                <p className="text-sm text-blue-100">Gestión académica centralizada</p>
              </div>
            </div>
            <h2 className="text-4xl font-black leading-tight">Gestiona tu aula virtual de forma simple y ordenada.</h2>
            <p className="mt-5 text-blue-100 leading-relaxed">Consulta clases, actividades, evaluaciones y reportes desde un espacio claro para cada tipo de usuario.</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="glass rounded-2xl p-4"><Users className="mx-auto text-blue-100" /><p className="mt-2 text-xs text-blue-100">Usuarios</p></div>
            <div className="glass rounded-2xl p-4"><ShieldCheck className="mx-auto text-blue-100" /><p className="mt-2 text-xs text-blue-100">Seguridad</p></div>
            <div className="glass rounded-2xl p-4"><BookOpenCheck className="mx-auto text-blue-100" /><p className="mt-2 text-xs text-blue-100">Cursos</p></div>
          </div>
        </section>

        <section className="p-6 sm:p-8 lg:p-12">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-11 w-11 shrink-0 rounded-2xl bg-blue-600 text-white flex items-center justify-center"><GraduationCap /></div>
            <div className="min-w-0">
              <h1 className="font-black text-slate-900 leading-tight text-base break-words">Sistema Académico Universitario</h1>
              <p className="text-xs sm:text-sm text-slate-500">Gestión académica centralizada</p>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Iniciar sesion</h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500">Ingresa con tu cuenta institucional para continuar.</p>

          {error && <div className="mt-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}

          <form onSubmit={submit} className="mt-7 space-y-5">
            <Field icon={Mail} label="Correo electronico" type="email" value={correo} onChange={e => setCorreo(e.target.value)} />
            <Field icon={Lock} label="Contrasena" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button disabled={loading} className="w-full rounded-2xl bg-blue-600 py-3.5 font-black text-white hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-60">
              {loading ? 'Validando...' : 'Entrar al sistema'} <ArrowRight size={19} />
            </button>
          </form>

          <Link to="/registro" className="mt-5 block text-center font-black text-blue-700 hover:text-blue-900">Crear una cuenta</Link>

          <div className="mt-6 sm:mt-8 rounded-3xl bg-slate-50 border border-slate-200 p-4 sm:p-5 text-xs sm:text-sm text-slate-600 break-words">
            <p className="font-black text-slate-800 mb-3">Cuentas de prueba</p>
            <p><b>Admin:</b> admin@universidad.edu.pe / 12345</p>
            <p><b>Docente:</b> docente@universidad.edu.pe / 12345</p>
            <p><b>Estudiante:</b> estudiante@universidad.edu.pe / 12345</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function Field({ icon: Icon, label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <div className="relative mt-2">
        <Icon className="absolute left-4 top-3.5 text-slate-400" size={20} />
        <input {...props} required className="w-full min-w-0 rounded-2xl border border-slate-200 py-3 pl-12 pr-3 sm:pr-4 text-sm sm:text-base outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
      </div>
    </label>
  )
}
