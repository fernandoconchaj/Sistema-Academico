import { BookOpen, Clock, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CourseCard({ course, role = 'student' }) {
  const basePath = role === 'teacher' ? '/docente/curso' : '/estudiante/curso'

  return (
    <div className="group rounded-3xl bg-white shadow-card border border-slate-100 overflow-hidden hover:-translate-y-1 hover:shadow-soft transition duration-300">
      <div className={`h-32 bg-gradient-to-br ${course.color} p-5 text-white relative overflow-hidden`}>
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15" />
        <div className="absolute right-8 bottom-4 h-16 w-16 rounded-full bg-white/10" />
        <p className="text-xs font-bold uppercase tracking-wider text-white/80">{course.codigo}</p>
        <h3 className="mt-2 text-xl font-black leading-tight max-w-xs">{course.nombre}</h3>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"><BookOpen size={14} /> {course.categoria}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"><Clock size={14} /> {course.modalidad}</span>
        </div>

        <p className="text-sm text-slate-500 line-clamp-2 min-h-[42px]">{course.descripcion}</p>

        <div className="mt-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
            <GraduationCap size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Docente</p>
            <p className="text-sm font-bold text-slate-700">{typeof course.docente === 'string' ? course.docente : `${course.docente?.nombres || ''} ${course.docente?.apellidos || ''}`}</p>
          </div>
        </div>

        {role === 'student' && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span>Progreso</span>
              <span>{course.progreso ?? course.avance ?? 0}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${course.progreso ?? course.avance ?? 0}%` }} />
            </div>
          </div>
        )}

        <Link to={`${basePath}/${course.id}`} className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white hover:bg-blue-700 transition">
          {role === 'teacher' ? 'Gestionar curso' : 'Ver curso'}
        </Link>
      </div>
    </div>
  )
}
