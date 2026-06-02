import { HelpCircle, MessageCircle, ShieldCheck, Video, Mail, Search } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'

const faqs = [
  ['¿Como veo mis cursos?', 'Ingresa a Mis cursos y presiona Ver curso para revisar contenido, tareas, evaluaciones y Zoom.'],
  ['¿Como entrego una tarea?', 'Entra al curso, abre la pestana Tareas y presiona Entregar tarea.'],
  ['¿Como ingreso a Zoom?', 'Entra al curso, abre Zoom y presiona Unirse al Zoom en la clase programada.'],
  ['¿Que hago si olvide mi clave?', 'Contacta a soporte academico para restablecer tu acceso.']
]
export default function HelpPage() {
  return (
    <DashboardLayout role="ESTUDIANTE" title="Centro de ayuda" subtitle="Resuelve dudas frecuentes sobre la plataforma academica">
      <section className="rounded-[2rem] bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-8 shadow-soft mb-7">
        <div className="max-w-3xl"><h2 className="text-3xl font-black">¿En que podemos ayudarte?</h2><p className="text-blue-100 mt-2">Busca informacion sobre cursos, evaluaciones, tareas, Zoom o soporte tecnico.</p><div className="relative mt-6"><Search className="absolute left-4 top-3.5 text-blue-200"/><input className="w-full rounded-2xl bg-white/15 border border-white/20 px-12 py-4 outline-none placeholder:text-blue-100" placeholder="Buscar ayuda..."/></div></div>
      </section>
      <section className="grid md:grid-cols-4 gap-5 mb-7"><HelpCard icon={MessageCircle} title="Chat" text="Comunicate con tus docentes."/><HelpCard icon={Video} title="Zoom" text="Consulta clases en vivo y grabaciones."/><HelpCard icon={ShieldCheck} title="Seguridad" text="Cuida tus datos y tu contraseña."/><HelpCard icon={Mail} title="Soporte" text="soporte@universidad.edu.pe"/></section>
      <section className="rounded-[2rem] bg-white border border-slate-100 shadow-card p-6"><h3 className="text-xl font-black text-slate-900 mb-5">Preguntas frecuentes</h3><div className="space-y-3">{faqs.map(([q,a])=><details key={q} className="rounded-2xl border border-slate-100 p-5 bg-slate-50"><summary className="cursor-pointer font-black text-slate-800">{q}</summary><p className="mt-3 text-sm text-slate-500 leading-relaxed">{a}</p></details>)}</div></section>
    </DashboardLayout>
  )
}
function HelpCard({ icon: Icon, title, text }) { return <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-card"><div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4"><Icon /></div><p className="font-black text-slate-900">{title}</p><p className="text-sm text-slate-500 mt-1">{text}</p></div> }
