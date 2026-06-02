import { Settings, Save } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'

export default function TeacherConfig() {
  return (
    <DashboardLayout role="DOCENTE" title="Configuracion docente" subtitle="Preferencias basicas del perfil academico">
      <div className="max-w-3xl rounded-3xl bg-white border border-slate-100 shadow-card p-7">
        <div className="flex items-center gap-3 mb-6"><div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center"><Settings /></div><div><h2 className="text-xl font-black text-slate-900">Datos del docente</h2><p className="text-sm text-slate-500">Configuracion visual simulada para el frontend.</p></div></div>
        <form onSubmit={(e)=>{e.preventDefault(); alert('Configuracion guardada correctamente')}} className="grid sm:grid-cols-2 gap-4">
          <Input label="Nombres" value="Carlos" />
          <Input label="Apellidos" value="Ramirez" />
          <Input label="Correo" value="docente@universidad.edu.pe" />
          <Input label="Especialidad" value="Ingenieria de Software" />
          <label className="sm:col-span-2 block"><span className="text-sm font-black text-slate-700">Descripcion docente</span><textarea defaultValue="Docente de desarrollo web, frameworks modernos y arquitectura full stack." rows="4" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" /></label>
          <button className="sm:col-span-2 rounded-2xl bg-blue-600 text-white py-3 font-black flex items-center justify-center gap-2"><Save size={18}/> Guardar cambios</button>
        </form>
      </div>
    </DashboardLayout>
  )
}
function Input({ label, value }) { return <label className="block"><span className="text-sm font-black text-slate-700">{label}</span><input defaultValue={value} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" /></label> }
