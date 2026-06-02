import { Bell, CalendarDays, Save, Shield } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'

export default function AdminConfig(){
  function save(e){ e.preventDefault(); alert('Configuracion guardada correctamente') }
  return <DashboardLayout role="ADMIN" title="Configuracion administrativa" subtitle="Ajustes generales de la plataforma academica">
    <form onSubmit={save} className="grid xl:grid-cols-2 gap-5 lg:gap-7">
      <section className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5"><Shield className="text-blue-600"/><h3 className="font-black text-slate-900">Seguridad y acceso</h3></div>
        <Input label="Dominio institucional" value="universidad.edu.pe"/>
        <Input label="Tiempo de sesion" value="60 minutos"/>
        <label className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 mt-4">
          <span className="font-black text-slate-700">Permitir registro de estudiantes</span>
          <input type="checkbox" defaultChecked className="h-5 w-5 shrink-0"/>
        </label>
      </section>

      <section className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5"><Bell className="text-orange-600"/><h3 className="font-black text-slate-900">Notificaciones</h3></div>
        <Check label="Alertas de tareas" checked />
        <Check label="Avisos de clases virtuales" checked />
        <Check label="Reportes semanales" />
      </section>

      <section className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-card xl:col-span-2">
        <div className="flex items-center gap-3 mb-5"><CalendarDays className="text-emerald-600"/><h3 className="font-black text-slate-900">Parametros academicos</h3></div>
        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Periodo academico" value="2026 - Ciclo 1"/>
          <Input label="Modalidad principal" value="Semipresencial"/>
          <Input label="Horario de atencion" value="Lunes a sabado"/>
        </div>
        <p className="mt-4 text-sm text-slate-500">Estos valores sirven como referencia para los modulos de cursos, comunicados y seguimiento academico.</p>
        <button className="mt-6 rounded-2xl bg-blue-600 text-white px-6 py-3 font-black flex items-center justify-center gap-2 w-full sm:w-auto"><Save size={18}/>Guardar configuracion</button>
      </section>
    </form>
  </DashboardLayout>
}

function Check({label, checked=false}){
  return <label className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 mt-3 first:mt-0">
    <span className="font-black text-slate-700">{label}</span>
    <input type="checkbox" defaultChecked={checked} className="h-5 w-5 shrink-0"/>
  </label>
}

function Input({label,value}){
  return <label className="block mt-4 first:mt-0"><span className="text-sm font-black text-slate-700">{label}</span><input defaultValue={value} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100"/></label>
}
