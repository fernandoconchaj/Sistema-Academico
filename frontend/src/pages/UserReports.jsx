import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Download, FileWarning, Image, Send, UploadCloud } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { api } from '../api/client.js'

function routeBase(role){ return role === 'DOCENTE' ? '/api/docente' : '/api/estudiante' }
function fileToBase64(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(String(r.result).split(',')[1]||''); r.onerror=rej; r.readAsDataURL(file) }) }
function downloadFile(name,type,base64){ const a=document.createElement('a'); a.href=`data:${type||'application/octet-stream'};base64,${base64}`; a.download=name||'evidencia'; a.click() }

export default function UserReports({ role='ESTUDIANTE' }){
  const [cursos,setCursos]=useState([])
  const [reportes,setReportes]=useState([])
  const [loading,setLoading]=useState(true)
  const [form,setForm]=useState({cursoId:'', tipo:'Reclamo academico', prioridad:'Media', asunto:'', descripcion:'', archivoNombre:'', archivoTipo:'', archivoBase64:''})
  const [msg,setMsg]=useState('')
  const roleTitle = role === 'DOCENTE' ? 'Reportes y reclamos docente' : 'Reportes y reclamos estudiante'

  async function load(){
    setLoading(true)
    try{
      const base = routeBase(role)
      const data = await api(`${base}/reportes`)
      setReportes(Array.isArray(data)?data:[])
      const dash = await api(`${base}/dashboard`)
      setCursos(dash.cursos || [])
      if(!form.cursoId && dash.cursos?.length) setForm(f=>({...f, cursoId:String(dash.cursos[0].id)}))
    } finally { setLoading(false) }
  }
  useEffect(()=>{ load() },[])

  async function onFile(e){ const file=e.target.files?.[0]; if(!file) return; setForm(f=>({...f, archivoNombre:file.name, archivoTipo:file.type||'application/octet-stream'})); const b64=await fileToBase64(file); setForm(f=>({...f, archivoBase64:b64})) }
  async function submit(e){
    e.preventDefault(); setMsg('')
    if(!form.asunto.trim() || !form.descripcion.trim()){ setMsg('Completa asunto y descripcion.'); return }
    await api(`${routeBase(role)}/reportes`, {method:'POST', body:JSON.stringify({...form, cursoId: form.cursoId?Number(form.cursoId):null})})
    setForm(f=>({...f, asunto:'', descripcion:'', archivoNombre:'', archivoTipo:'', archivoBase64:''}))
    setMsg('Reporte enviado al administrador correctamente.')
    await load()
  }

  const pendientes = useMemo(()=>reportes.filter(r=>r.estado==='Pendiente').length,[reportes])

  return <DashboardLayout role={role} title={roleTitle} subtitle="Envia incidencias reales al administrador y revisa su respuesta">
    <section className="grid lg:grid-cols-[460px_1fr] gap-7">
      <form onSubmit={submit} className="rounded-3xl bg-white p-6 border border-slate-100 shadow-card h-fit">
        <div className="flex items-center gap-3 mb-5"><div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center"><FileWarning/></div><div><h3 className="text-xl font-black text-slate-900">Nuevo reporte</h3><p className="text-sm text-slate-500">Puedes adjuntar captura, PDF, Word o imagen.</p></div></div>
        {msg&&<div className="mb-4 rounded-2xl bg-blue-50 text-blue-700 px-4 py-3 text-sm font-bold">{msg}</div>}
        <label className="form-label">Curso relacionado</label>
        <select value={form.cursoId} onChange={e=>setForm({...form,cursoId:e.target.value})} className="input mb-4"><option value="">General / sin curso</option>{cursos.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select>
        <div className="grid sm:grid-cols-2 gap-4"><div><label className="form-label">Tipo</label><select value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value})} className="input"><option>Reclamo academico</option><option>Problema tecnico</option><option>Consulta administrativa</option><option>Solicitud de revision</option></select></div><div><label className="form-label">Prioridad</label><select value={form.prioridad} onChange={e=>setForm({...form,prioridad:e.target.value})} className="input"><option>Baja</option><option>Media</option><option>Alta</option></select></div></div>
        <label className="form-label mt-4">Asunto</label><input value={form.asunto} onChange={e=>setForm({...form,asunto:e.target.value})} className="input" placeholder="Ejemplo: No aparece mi nota" />
        <label className="form-label mt-4">Descripcion</label><textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} className="input min-h-[130px]" placeholder="Explica tu caso con detalle" />
        <label className="form-label mt-4">Evidencia opcional</label><div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-4"><input type="file" onChange={onFile} accept="image/*,.pdf,.doc,.docx,.ppt,.pptx"/><p className="mt-2 text-sm font-bold text-slate-600">{form.archivoNombre || 'No has seleccionado archivo.'}</p></div>
        <button className="mt-5 w-full rounded-2xl bg-blue-600 text-white py-4 font-black flex items-center justify-center gap-2"><Send size={18}/>Enviar reporte</button>
      </form>

      <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-card">
        <div className="flex items-center justify-between mb-5"><div><h3 className="text-xl font-black text-slate-900">Mis reportes enviados</h3><p className="text-sm text-slate-500">{pendientes} pendiente(s) de respuesta</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{reportes.length} registros</span></div>
        {loading ? <p>Cargando...</p> : reportes.length===0 ? <div className="rounded-2xl bg-slate-50 p-6 text-slate-500 font-bold">Aun no enviaste reportes.</div> : <div className="space-y-4">{reportes.map(r=><article key={r.id} className="rounded-2xl border border-slate-200 p-5 bg-slate-50"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-blue-700 uppercase">{r.tipo} {r.curso?.nombre ? `- ${r.curso.nombre}` : ''}</p><h4 className="text-lg font-black text-slate-900 mt-1">{r.asunto}</h4><p className="text-sm text-slate-600 mt-2">{r.descripcion}</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ${r.estado==='Resuelto'?'bg-emerald-100 text-emerald-700':'bg-yellow-100 text-yellow-700'}`}>{r.estado}</span></div>{r.archivoBase64&&<button onClick={()=>downloadFile(r.archivoNombre,r.archivoTipo,r.archivoBase64)} className="mt-3 rounded-xl bg-white border border-slate-200 px-4 py-2 font-black text-blue-700 flex items-center gap-2"><Download size={16}/>Descargar evidencia: {r.archivoNombre}</button>}{r.respuestaAdmin ? <div className="mt-4 rounded-2xl bg-white border border-emerald-100 p-4"><p className="text-sm font-black text-emerald-700 flex items-center gap-2"><CheckCircle2 size={16}/>Respuesta del administrador</p><p className="text-sm text-slate-700 mt-2">{r.respuestaAdmin}</p></div> : <p className="mt-4 text-sm text-slate-500 flex items-center gap-2"><AlertCircle size={16}/>Aun pendiente de respuesta del administrador.</p>}</article>)}</div>}
      </div>
    </section>
  </DashboardLayout>
}
