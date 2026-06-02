import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, BookOpen, GraduationCap, Layers, PlayCircle, Sparkles, Users } from 'lucide-react'
import { categories, courses } from '../data/mockData.js'
import CourseCard from '../components/CourseCard.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      <nav className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <GraduationCap size={26} />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-sm min-[380px]:text-base sm:text-xl leading-tight break-words">Sistema Académico Universitario</h1>
            <p className="text-xs text-slate-400">Plataforma academica</p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <Link to="/login" className="hidden sm:inline-flex rounded-2xl px-5 py-3 text-sm font-bold text-slate-200 hover:text-white">Iniciar sesion</Link>
          <Link to="/registro" className="rounded-2xl bg-white px-3 min-[380px]:px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-slate-950 hover:bg-blue-50 transition">Registrarse</Link>
        </div>
      </nav>

      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-12 pb-16 sm:pb-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center min-w-0">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-blue-600/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-2 text-xs sm:text-sm font-bold text-blue-100">
            <Sparkles size={16} className="shrink-0" /> <span className="truncate">Gestion academica para el trabajo diario</span>
          </div>
          <h2 className="mt-7 text-4xl min-[380px]:text-[2.55rem] sm:text-5xl lg:text-6xl font-black leading-[1.12] tracking-tight">
            Organiza clases, tareas y evaluaciones desde una sola plataforma.
          </h2>
          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
            Una solución académica para consultar cursos, administrar actividades, revisar reportes y mantener la comunicación entre estudiantes, docentes y administradores.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 font-black text-white hover:bg-blue-500 transition shadow-lg shadow-blue-900/40">
              Entrar a mi aula <ArrowRight size={20} />
            </Link>
            <a href="#cursos" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-7 py-4 font-black text-white border border-white/15 hover:bg-white/15 transition">
              Ver cursos <PlayCircle size={20} />
            </a>
          </div>
          <div className="mt-10 grid grid-cols-1 min-[380px]:grid-cols-3 gap-3 sm:gap-4 max-w-lg">
            <MiniStat icon={BookOpen} value="8+" label="Cursos" />
            <MiniStat icon={Users} value="3" label="Roles" />
            <MiniStat icon={BadgeCheck} value="Web" label="Adaptable" />
          </div>
        </div>

        <div className="relative z-10 min-w-0">
          <div className="rounded-[2rem] bg-white/10 border border-white/15 p-5 shadow-soft backdrop-blur-xl rotate-1 hover:rotate-0 transition">
            <div className="rounded-[1.5rem] bg-slate-50 text-slate-900 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-bold text-slate-500">Panel estudiante</p>
                  <h3 className="text-2xl font-black">Mis cursos activos</h3>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center"><Layers /></div>
              </div>
              <div className="space-y-4">
                {courses.slice(0,3).map(c => (
                  <div key={c.id} className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-900">{c.nombre}</p>
                        <p className="text-xs text-slate-500 font-semibold">{c.docente} • {c.modalidad}</p>
                      </div>
                      <span className="text-sm font-black text-blue-700">{c.progreso}%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-blue-600" style={{width:`${c.progreso}%`}} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white text-slate-900 py-16" id="cursos">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <p className="font-black text-blue-700">Catalogo academico</p>
              <h2 className="mt-2 text-4xl font-black">Cursos destacados</h2>
              <p className="mt-3 text-slate-500 max-w-2xl">Consulta informacion de cursos, docentes, modalidad, avance y actividades pendientes.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0,5).map(cat => <span key={cat} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">{cat}</span>)}
            </div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {courses.map(course => <CourseCard key={course.id} course={course} />)}
          </div>
        </div>
      </section>
    </div>
  )
}

function MiniStat({ icon: Icon, value, label }) {
  return (
    <div className="glass rounded-2xl p-4">
      <Icon size={20} className="text-blue-200" />
      <p className="mt-3 text-2xl font-black">{value}</p>
      <p className="text-xs font-bold text-slate-300">{label}</p>
    </div>
  )
}
