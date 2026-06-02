import { useEffect, useMemo, useState } from 'react'
import { BarChart3, CheckCircle2, Download, FileText, MessageSquareWarning, Paperclip, TrendingUp } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { api, apiBlob } from '../api/client.js'

function fullName(u){ return `${u?.nombres||''} ${u?.apellidos||''}`.trim() || 'Sin nombre' }
function downloadFile(name,type,base64){ const a=document.createElement('a'); a.href=`data:${type||'application/octet-stream'};base64,${base64}`; a.download=name||'evidencia'; a.click() }

export default function AdminReports(){
  const [selected,setSelected]=useState('reclamos')
  const [data,setData]=useState({estudiantes:[],docentes:[],cursos:[],inscripciones:[],reclamos:[]})
  const [loading,setLoading]=useState(true)
  const [active,setActive]=useState(null)
  const [respuesta,setRespuesta]=useState('')
  const [estado,setEstado]=useState('Resuelto')

  async function load(){ setLoading(true); try{ setData(await api('/api/admin/reportes')) } finally { setLoading(false) } }
  useEffect(()=>{ load() },[])

  const reports = useMemo(()=>({
    reclamos: { title:'Reportes y reclamos recibidos', description:'Casos enviados por estudiantes y docentes desde sus modulos, con evidencia opcional.', headers:['Usuario','Rol','Curso','Asunto','Estado','Prioridad','Evidencia'], rows:(data.reclamos||[]).map(r=>({raw:r, values:[fullName(r.usuario), r.rol, r.curso?.nombre || 'General', r.asunto, r.estado, r.prioridad, r.archivoNombre || 'Sin archivo']})) },
    estudiantes: { title:'Reporte de estudiantes', description:'Usuarios registrados con rol estudiante.', headers:['Nombre','Correo','Estado'], rows:(data.estudiantes||[]).map(u=>({raw:u, values:[fullName(u), u.correo, u.estado]})) },
    docentes: { title:'Reporte de docentes', description:'Usuarios registrados con rol docente.', headers:['Nombre','Correo','Especialidad','Estado'], rows:(data.docentes||[]).map(u=>({raw:u, values:[fullName(u), u.correo, u.especialidad || '-', u.estado]})) },
    cursos: { title:'Reporte de cursos publicados', description:'Cursos creados por administracion y asignados a docentes y estudiantes.', headers:['Curso','Codigo','Docente','Modalidad','Aula'], rows:(data.cursos||[]).map(c=>({raw:c, values:[c.nombre, c.codigo, fullName(c.docente), c.modalidad, c.aula || '-']})) },
    inscripciones: { title:'Reporte de inscripciones', description:'Matriculas reales entre estudiantes y cursos.', headers:['Estudiante','Curso','Fecha','Estado'], rows:(data.inscripciones||[]).map(i=>({raw:i, values:[fullName(i.estudiante), i.curso?.nombre || '-', i.fecha || '-', i.estado]})) }
  }),[data])

  const current=reports[selected]
  const metrics=useMemo(()=>[
    {label:'Usuarios registrados', value:data.totalUsuarios ?? ((data.estudiantes?.length||0)+(data.docentes?.length||0)), icon:BarChart3, color:'bg-blue-50 text-blue-700'},
    {label:'Cursos activos', value:data.totalCursos ?? (data.cursos?.length||0), icon:FileText, color:'bg-emerald-50 text-emerald-700'},
    {label:'Tareas creadas', value:data.totalTareas ?? 0, icon:TrendingUp, color:'bg-orange-50 text-orange-700'},
    {label:'Reclamos pendientes', value:data.reclamosPendientes ?? (data.reclamos||[]).filter(r=>r.estado==='Pendiente').length, icon:MessageSquareWarning, color:'bg-red-50 text-red-700'}
  ],[data])

  async function responder(){ if(!active) return; await api(`/api/admin/reclamos/${active.id}`, {method:'PUT', body:JSON.stringify({estado, respuestaAdmin:respuesta})}); setActive(null); setRespuesta(''); await load() }
  async function descargarExcel(){
    const blob = await apiBlob('/api/admin/reportes/excel');
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sistema-academico-reporte.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }


  return <DashboardLayout role="ADMIN" title="Reportes administrativos" subtitle="Informes, reclamos y evidencias del sistema">
    <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">{metrics.map(m=>{const Icon=m.icon; return <div key={m.label} className="rounded-3xl bg-white border border-slate-100 p-6 shadow-card"><div className={`h-12 w-12 rounded-2xl ${m.color} flex items-center justify-center`}><Icon/></div><p className="text-sm text-slate-500 mt-4">{m.label}</p><h3 className="text-3xl font-black text-slate-900 mt-1">{m.value}</h3></div>})}</section>
    <section className="grid xl:grid-cols-[340px_1fr] gap-7"><aside className="rounded-3xl bg-white p-5 border border-slate-100 shadow-card h-fit"><h3 className="font-black text-slate-900 mb-4">Modulos de reporte</h3>{Object.entries(reports).map(([key,r])=><button key={key} onClick={()=>setSelected(key)} className={`w-full mb-3 rounded-2xl px-4 py-4 text-left font-black transition ${selected===key?'bg-blue-600 text-white':'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700'}`}>{r.title}</button>)}<p className="mt-3 rounded-2xl bg-slate-50 p-4 text-xs font-bold text-slate-500">Los reclamos se responden desde aqui. Los usuarios ven la respuesta en su modulo de reportes.</p></aside>
      <div className="rounded-3xl bg-white border border-slate-100 p-6 shadow-card"><div className="flex items-center justify-between mb-5"><div><h3 className="text-xl font-black text-slate-900">{current.title}</h3><p className="text-sm text-slate-500">{current.description}</p></div><div className="flex items-center gap-2"><button onClick={descargarExcel} className="rounded-full bg-emerald-600 text-white px-4 py-2 text-xs font-black flex items-center gap-2"><Download size={16}/>Excel</button><span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-black">{current.rows.length} registros</span></div></div>
        {loading ? <p>Cargando...</p> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{current.headers.map(h=><th key={h} className="text-left bg-slate-50 py-3 px-3 text-slate-500 font-black first:rounded-l-xl last:rounded-r-xl">{h}</th>)}{selected==='reclamos'&&<th className="text-left bg-slate-50 py-3 px-3 text-slate-500 font-black rounded-r-xl">Accion</th>}</tr></thead><tbody>{current.rows.map((r,i)=><tr key={i} className="border-b border-slate-100 last:border-0">{r.values.map((c,j)=><td key={j} className="py-4 px-3 font-semibold text-slate-700">{c}</td>)}{selected==='reclamos'&&<td className="py-4 px-3"><button onClick={()=>{setActive(r.raw); setRespuesta(r.raw.respuestaAdmin||''); setEstado(r.raw.estado||'Resuelto')}} className="rounded-xl bg-slate-900 text-white px-4 py-2 font-black">Atender</button></td>}</tr>)}</tbody></table></div>}
      </div></section>

    {active&&<div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden"><div className="p-6 border-b border-slate-100 flex items-center justify-between"><div><h3 className="text-xl font-black text-slate-900">Atender reclamo o incidencia</h3><p className="text-sm text-slate-500">Responde al usuario y cambia el estado del caso.</p></div><button onClick={()=>setActive(null)} className="h-10 w-10 rounded-full bg-slate-100 font-black">×</button></div><div className="p-6 grid lg:grid-cols-[1fr_1fr] gap-5"><div className="space-y-4"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black text-blue-700 uppercase">{active.tipo} · {active.prioridad}</p><p className="font-black text-slate-900 text-lg mt-1">{active.asunto}</p><p className="text-sm text-slate-600 mt-1">{fullName(active.usuario)} - {active.rol} - {active.curso?.nombre || 'General'}</p><p className="mt-3 text-slate-700 whitespace-pre-wrap">{active.descripcion}</p></div>{active.archivoBase64?<button onClick={()=>downloadFile(active.archivoNombre,active.archivoTipo,active.archivoBase64)} className="w-full rounded-2xl bg-blue-50 text-blue-700 py-3 font-black flex items-center justify-center gap-2"><Paperclip size={18}/>Descargar evidencia: {active.archivoNombre}</button>:<div className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Este reporte no tiene evidencia adjunta.</div>}</div><div className="space-y-4"><label className="form-label">Estado</label><select value={estado} onChange={e=>setEstado(e.target.value)} className="input"><option>Pendiente</option><option>En revision</option><option>Resuelto</option><option>Rechazado</option></select><label className="form-label">Respuesta para el usuario</label><textarea value={respuesta} onChange={e=>setRespuesta(e.target.value)} className="input min-h-[180px]" placeholder="Ejemplo: Se reviso el caso y se corrigio el acceso al curso."/><button onClick={responder} className="w-full rounded-2xl bg-blue-600 text-white py-4 font-black flex justify-center gap-2"><CheckCircle2/>Guardar respuesta</button></div></div></div></div>}
  </DashboardLayout>
}
