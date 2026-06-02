import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { BookOpen, CalendarDays, CheckCircle2, Download, Edit3, ExternalLink, FilePlus2, FileUp, Megaphone, Save, Trash2, Upload, Video, X } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { api, normalizeCourse } from '../api/client.js'

const tabs = ['Contenido', 'Tareas', 'Evaluaciones', 'Zoom', 'Anuncios']

export default function CourseDetail({ mode = 'student' }) {
  const { id } = useParams()
  const location = useLocation()
  const initialTab = new URLSearchParams(location.search).get('tab') || 'Contenido'
  const [tab, setTab] = useState(initialTab)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')

  async function load() {
    setError('')
    const endpoint = mode === 'teacher' ? `/api/docente/cursos/${id}` : `/api/estudiante/cursos/${id}`
    const res = await api(endpoint)
    setData({ ...res, curso: normalizeCourse(res.curso), misEntregas: res.misEntregas || {}, misRespuestas: res.misRespuestas || {} })
  }

  useEffect(() => { setTab(new URLSearchParams(location.search).get('tab') || 'Contenido') }, [location.search])
  useEffect(() => { load().catch(err => setError(err.message || 'Error en la solicitud')) }, [id, mode])

  function openModal(type, item) { setModal(type); setSelected(item) }
  function closeModal() { setModal(null); setSelected(null) }
  async function refreshWith(msg) { setMessage(msg); await load(); setTimeout(() => setMessage(''), 3500) }

  const course = data?.curso
  const role = mode === 'teacher' ? 'DOCENTE' : 'ESTUDIANTE'

  return <DashboardLayout role={role} title={course?.nombre || 'Curso'} subtitle={course ? `${course.codigo} · ${course.docente} · ${course.modalidad}` : 'Detalle del curso'}>
    {error && <div className="rounded-3xl bg-red-50 border border-red-200 p-5 text-red-700 font-black mb-6">{error}</div>}
    {message && <div className="rounded-3xl bg-green-50 border border-green-200 p-5 text-green-700 font-black mb-6">{message}</div>}
    {!data && !error && <div className="rounded-3xl bg-white p-8 shadow-card font-black text-slate-500">Cargando curso...</div>}

    {course && <>
      <Link to={mode === 'teacher' ? '/docente' : '/estudiante'} className="inline-flex items-center rounded-2xl bg-white border border-slate-200 px-5 py-3 font-black text-slate-700 shadow-sm hover:bg-blue-50 mb-6">← Volver</Link>
      <section className={`rounded-[2rem] bg-gradient-to-br ${course.color} text-white p-8 md:p-10 mb-7 relative overflow-hidden`}>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15" />
        <p className="text-sm font-black uppercase text-white/80">{course.categoria}</p>
        <h1 className="mt-3 text-4xl font-black">{course.nombre}</h1>
        <p className="mt-4 max-w-3xl text-white/90">{course.descripcion}</p>
        <div className="mt-6 flex flex-wrap gap-3"><Badge>{course.creditos} creditos</Badge><Badge>{course.ciclo}</Badge><Badge>{course.modalidad}</Badge><Badge>{course.aula}</Badge></div>
      </section>

      <nav className="rounded-3xl bg-white border border-slate-100 p-3 shadow-card mb-7 flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap gap-2">{tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`rounded-2xl px-5 py-3 font-black text-sm transition ${tab === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}>{t}</button>)}</div>
        <div className="flex flex-wrap gap-2">
          {mode === 'teacher' && tab === 'Contenido' && <button onClick={() => openModal('nuevoMaterial', null)} className="rounded-2xl bg-blue-600 text-white px-5 py-3 font-black text-sm hover:bg-blue-700 flex items-center gap-2"><FilePlus2 size={18}/> Subir material</button>}
          {mode === 'teacher' && tab === 'Anuncios' && <button onClick={() => openModal('nuevoAnuncio', null)} className="rounded-2xl bg-blue-600 text-white px-5 py-3 font-black text-sm hover:bg-blue-700 flex items-center gap-2"><Megaphone size={18}/> Publicar anuncio</button>}
        </div>
      </nav>

      {tab === 'Contenido' && <Grid items={data.materiales || []} icon={BookOpen} mapper={m => { const visto = !!data.materialesVistos?.[m.id]; return { title:m.titulo, visto, meta:`${m.semana || 'Semana'} • ${m.tipo || 'PDF'} • ${mode === 'teacher' ? (m.estado || 'Publicado') : (visto ? 'Visto' : 'Pendiente')} • ${m.archivoNombre || 'material.pdf'}`, action: mode === 'teacher' ? 'Ver / editar material' : (visto ? 'Ver nuevamente' : 'Ver material'), onClick: () => openModal('material', { ...m, visto }) } }} />}
      {tab === 'Tareas' && <Grid items={data.tareas || []} icon={FileUp} mapper={t => { const entrega = data.misEntregas?.[t.id]; return { title:t.titulo, meta:`Fecha limite: ${t.fechaLimite || t.fecha} • ${entrega ? entrega.estado : t.estado} • Puntaje: ${t.puntaje}${entrega?.nota != null ? ` • Nota: ${entrega.nota}` : ''}`, action: mode === 'teacher' ? 'Ver entregas reales' : (entrega ? 'Actualizar entrega' : 'Entregar tarea'), onClick: () => openModal('tarea', t) } }} />}
      {tab === 'Evaluaciones' && <Grid items={data.evaluaciones || []} icon={CalendarDays} mapper={e => { const respuesta = data.misRespuestas?.[e.id]; return { title:e.titulo, meta:`${e.fecha} • ${e.duracionMinutos || 30} min • Intentos: ${e.intentos} • ${respuesta ? respuesta.estado : e.estado}${respuesta?.puntaje != null ? ` • Nota: ${respuesta.puntaje}` : ''}`, action: mode === 'teacher' ? 'Ver respuestas reales' : (respuesta ? 'Ver resultado' : 'Realizar evaluacion'), onClick: () => openModal('evaluacion', e) } }} />}
      {tab === 'Zoom' && <Grid items={data.zoom || []} icon={Video} mapper={z => ({ title:z.titulo, meta:`${z.fecha} • ${z.hora} • ID: ${z.salaId || z.codigo || 'SAU-ZOOM'}`, action:'Unirse al Zoom', onClick: () => openModal('zoom', z) })} />}
      {tab === 'Anuncios' && <Grid items={data.anuncios || []} icon={Megaphone} mapper={a => ({ title:a.titulo, meta:`${a.fechaPublicacion || a.fecha} • ${a.mensaje}`, action:'Leer anuncio', onClick: () => openModal('anuncio', a) })} />}
    </>}

    {modal === 'material' && <MaterialModal item={selected} mode={mode} close={closeModal} onSaved={() => refreshWith('Material actualizado correctamente.')} onViewed={() => refreshWith('Material marcado como visto. Tu progreso se actualizo.')} onDeleted={() => { closeModal(); refreshWith('Material eliminado correctamente.') }} />}
    {modal === 'nuevoMaterial' && <MaterialEditorModal cursoId={Number(id)} close={closeModal} onSaved={() => { closeModal(); refreshWith('Material subido correctamente. Los estudiantes ya pueden verlo.') }} />}
    {modal === 'nuevoAnuncio' && <AnnouncementEditorModal cursoId={Number(id)} close={closeModal} onSaved={() => { closeModal(); refreshWith('Anuncio publicado. Las notificaciones de los estudiantes se actualizan automaticamente.') }} />}
    {modal === 'tarea' && mode === 'teacher' && <TeacherTaskModal item={selected} close={closeModal} />}
    {modal === 'tarea' && mode !== 'teacher' && <TaskModal item={selected} course={course} close={closeModal} submitted={data?.misEntregas?.[selected?.id]} onSubmitted={() => { closeModal(); refreshWith('Tarea entregada. El docente ya puede descargarla y calificarla.') }} />}
    {modal === 'evaluacion' && mode === 'teacher' && <TeacherEvaluationModal item={selected} close={closeModal} />}
    {modal === 'evaluacion' && mode !== 'teacher' && <EvaluationModal item={selected} course={course} close={closeModal} result={data?.misRespuestas?.[selected?.id]} onFinished={() => { closeModal(); refreshWith('Evaluacion enviada. El docente ya puede ver tu respuesta.') }} />}
    {modal === 'zoom' && <ZoomModal item={selected} close={closeModal} />}
    {modal === 'anuncio' && <AnnouncementModal item={selected} close={closeModal} />}
  </DashboardLayout>
}

function Badge({ children }) { return <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-black text-white">{children}</span> }
function Grid({ items, mapper, icon: Icon }) { if (!items.length) return <div className="rounded-3xl bg-white p-8 text-center text-slate-500 font-bold border border-slate-100 shadow-card">No hay elementos registrados.</div>; return <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">{items.map((it, idx) => { const m=mapper(it); return <div key={it.id || idx} className="rounded-3xl bg-white border border-slate-100 p-6 shadow-card hover:shadow-soft transition relative">{m.visto && <div className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700"><CheckCircle2 size={14}/> Visto</div>}<div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5"><Icon /></div><h3 className="font-black text-slate-900">{m.title}</h3><p className="mt-2 text-sm text-slate-500 leading-relaxed">{m.meta}</p><button onClick={m.onClick} className="mt-5 rounded-2xl bg-slate-900 text-white px-4 py-3 text-sm font-black hover:bg-blue-700 transition w-full">{m.action}</button></div>})}</div> }
function BaseModal({ title, children, close }) { return <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"><div className="w-full max-w-5xl max-h-[92vh] overflow-auto rounded-[2rem] bg-white shadow-2xl border border-slate-100"><div className="sticky top-0 z-10 bg-white border-b border-slate-100 p-5 flex items-center justify-between"><h2 className="text-xl font-black text-slate-900">{title}</h2><button onClick={close} className="h-10 w-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"><X size={18} /></button></div><div className="p-6">{children}</div></div></div> }

function MaterialModal({ item, mode, close, onSaved, onViewed, onDeleted }) {
  const [editing, setEditing] = useState(false)
  const [marked, setMarked] = useState(!!item?.visto)
  const canPreviewPdf = item?.archivoBase64 && (item.archivoTipo || '').includes('pdf')
  useEffect(() => {
    if (mode !== 'teacher' && item?.id && !marked) {
      api(`/api/estudiante/materiales/${item.id}/visto`, { method: 'POST' })
        .then(() => { setMarked(true); onViewed && onViewed() })
        .catch(() => {})
    }
  }, [item?.id, mode])

  return <BaseModal title={item.titulo} close={close}>
    {editing ? <MaterialEditorModal material={item} close={() => setEditing(false)} onSaved={onSaved} /> : <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5 md:p-7">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 font-bold mb-5"><span>{item.semana}</span><span>•</span><span>{item.tipo || 'PDF'}</span><span>•</span><span className="rounded-full bg-green-100 text-green-700 px-3 py-1">{mode === 'teacher' ? (item.estado || 'Publicado') : (marked ? 'Visto' : 'Pendiente')}</span><span>•</span><span>{item.archivoNombre || item.url || 'material.pdf'}</span></div>
      <div className="mx-auto max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-12 bg-slate-100 border-b flex items-center gap-4 px-4 text-slate-500 text-sm"><span className="font-black">PDF</span><span>|</span><span>Vista previa</span><span className="ml-auto">{item.archivoNombre || 'material.pdf'}</span></div>
        <div className="bg-slate-200 p-4 md:p-8 max-h-[560px] overflow-auto">
          {canPreviewPdf ? <PreviewFrame title={item.titulo} fileName={item.archivoNombre} fileType={item.archivoTipo} fileBase64={item.archivoBase64} /> : <FakePdf item={item} />}
        </div>
        <div className="p-4 flex flex-wrap gap-3 justify-between items-center text-sm text-slate-500"><span>{mode === 'teacher' ? 'El archivo puede descargarse, editarse o reemplazarse por el docente.' : 'Puedes descargar el material publicado por tu docente.'}</span>{(item.archivoBase64 || item.url) && <a href={item.archivoBase64 || item.url} target={item.archivoBase64 ? undefined : '_blank'} rel={item.archivoBase64 ? undefined : 'noreferrer'} download={item.archivoBase64 ? (item.archivoNombre || 'material.pdf') : undefined} className="inline-flex items-center gap-2 rounded-xl border border-blue-600 text-blue-700 px-4 py-2 font-black hover:bg-blue-50"><Download size={16}/> Descargar archivo</a>}</div>
      </div>
      {mode === 'teacher' && <div className="mt-5 flex gap-3"><button onClick={() => setEditing(true)} className="rounded-2xl bg-blue-600 text-white px-5 py-3 font-black flex items-center gap-2"><Edit3 size={18}/> Editar o cambiar PDF</button><button onClick={async () => { if (confirm('Deseas eliminar este material?')) { await api(`/api/docente/materiales/${item.id}`, { method:'DELETE' }); onDeleted() } }} className="rounded-2xl bg-red-50 text-red-700 px-5 py-3 font-black flex items-center gap-2"><Trash2 size={18}/> Quitar material</button></div>}
    </div>}
  </BaseModal>
}

function FakePdf({ item }) {
  const contenido = item.contenido || item.descripcion || 'Material cargado en la plataforma.'
  const paragraphs = contenido.split('.').map(t => t.trim()).filter(Boolean)
  return <div className="bg-white min-h-[560px] p-8 md:p-12 shadow-lg mx-auto max-w-2xl text-slate-800">
    <div className="border-b-8 border-emerald-500 pb-4 mb-6"><p className="text-sm font-black text-blue-700 uppercase">{item.semana || 'Material academico'}</p><h3 className="text-3xl font-black text-slate-900 mt-2">{item.titulo}</h3><p className="text-sm text-slate-500 mt-2">Sistema Académico Universitario</p></div>
    <h4 className="text-xl font-black text-rose-600 mb-4">Resumen del material</h4><ul className="space-y-3 list-disc pl-5 leading-relaxed">{(paragraphs.length ? paragraphs : [contenido]).map((p, i) => <li key={i}>{p}.</li>)}</ul>
    <div className="mt-10 rounded-2xl bg-blue-50 border border-blue-100 p-5"><p className="font-black text-blue-900">Actividad sugerida</p><p className="text-sm text-slate-600 mt-2">Lee el material, toma apuntes y revisa las tareas o evaluaciones relacionadas en la plataforma.</p></div>
  </div>
}

function MaterialEditorModal({ cursoId, material, close, onSaved }) {
  const [form, setForm] = useState({ semana: material?.semana || 'Semana nueva', titulo: material?.titulo || 'Nuevo material de clase', tipo: material?.tipo || 'PDF', archivoNombre: material?.archivoNombre || '', archivoTipo: material?.archivoTipo || '', archivoBase64: material?.archivoBase64 || '', contenido: material?.contenido || '', url: material?.url || '' })
  const [reading, setReading] = useState(false)
  async function pickFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setReading(true)
    const base64 = await fileToDataUrl(file)
    setForm(f => ({...f, archivoNombre:file.name, archivoTipo:file.type || 'application/octet-stream', archivoBase64:base64, tipo:file.type?.includes('pdf') ? 'PDF' : (file.name.split('.').pop() || 'Archivo').toUpperCase()}))
    setReading(false)
  }
  async function submit(e) {
    e.preventDefault()
    const payload = { ...form, cursoId: cursoId || material.curso?.id }
    if (material?.id) await api(`/api/docente/materiales/${material.id}`, { method:'PUT', body: JSON.stringify(payload) })
    else await api('/api/docente/materiales', { method:'POST', body: JSON.stringify(payload) })
    onSaved()
  }
  return <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
    <Input label="Semana" value={form.semana} onChange={e=>setForm({...form, semana:e.target.value})}/>
    <Input label="Tipo" value={form.tipo} onChange={e=>setForm({...form, tipo:e.target.value})}/>
    <Input label="Titulo" value={form.titulo} onChange={e=>setForm({...form, titulo:e.target.value})}/>
    <Input label="Nombre de archivo" value={form.archivoNombre} onChange={e=>setForm({...form, archivoNombre:e.target.value})}/>
    <label className="md:col-span-2 block"><span className="text-sm font-black text-slate-700">Subir o reemplazar archivo PDF, Word, PPT</span><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*" onChange={pickFile} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />{reading && <p className="text-sm text-blue-600 mt-2 font-bold">Cargando archivo...</p>}</label>
    <label className="md:col-span-2 block"><span className="text-sm font-black text-slate-700">Contenido o resumen</span><textarea value={form.contenido} onChange={e=>setForm({...form, contenido:e.target.value})} rows="6" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" placeholder="Resumen que se mostrara si el archivo no puede previsualizarse." /></label>
    <Input label="URL opcional" value={form.url} onChange={e=>setForm({...form, url:e.target.value})}/>
    <div className="md:col-span-2 flex gap-3"><button type="button" onClick={close} className="flex-1 rounded-2xl bg-slate-100 py-3.5 font-black text-slate-700">Cancelar</button><button className="flex-1 rounded-2xl bg-blue-600 py-3.5 text-white font-black hover:bg-blue-700 transition"><Save size={18} className="inline mr-2"/> Guardar material</button></div>
  </form>
}

function FilePreviewModal({ title, fileName, fileType, fileBase64, url, contenido, close }) {
  const [openUrl, setOpenUrl] = useState('')
  const lowerName = (fileName || url || '').toLowerCase()
  const isPdf = (fileType || '').includes('pdf') || lowerName.endsWith('.pdf')

  useEffect(() => {
    let objectUrl = ''
    if (fileBase64 && isPdf) {
      try {
        const blob = dataUrlToBlob(fileBase64, fileType || 'application/pdf')
        objectUrl = URL.createObjectURL(blob)
        setOpenUrl(objectUrl)
      } catch {
        setOpenUrl('')
      }
    } else if (url && isPdf) {
      setOpenUrl(url)
    } else {
      setOpenUrl('')
    }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [fileBase64, fileType, url, isPdf])

  function openPdfInNewTab() {
    if (!openUrl) return
    window.open(openUrl, '_blank', 'noopener,noreferrer')
  }

  return <BaseModal title={title || fileName || 'Vista del archivo'} close={close}>
    <div className="rounded-3xl bg-slate-50 border border-slate-200 p-5">
      <div className="flex flex-wrap gap-3 items-center text-sm font-bold text-slate-600 mb-4">
        <span>{fileName || 'archivo'}</span>
        <span>•</span>
        <span>{fileType || 'documento'}</span>
      </div>
      <div className="mx-auto max-w-4xl rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="h-12 bg-slate-100 border-b flex items-center gap-4 px-4 text-slate-500 text-sm"><span className="font-black">Vista previa</span><span className="ml-auto truncate">{fileName}</span></div>
        <div className="bg-slate-200 p-4 md:p-8 max-h-[560px] overflow-auto">
          {isPdf && openUrl ? <PreviewFrame title={title || fileName} fileName={fileName} fileType={fileType || 'application/pdf'} url={openUrl} /> : fileBase64 ? <UnsupportedFile fileName={fileName} /> : url ? <PreviewFrame title={title || fileName} fileName={fileName} fileType={fileType} url={url} /> : <FakePdf item={{ titulo:title, contenido: contenido || 'Documento de indicaciones de la tarea.' }} />}
        </div>
        <div className="p-4 flex flex-col sm:flex-row justify-end gap-3">
          {fileBase64 && <a href={fileBase64} download={fileName || 'archivo'} className="rounded-xl bg-blue-600 text-white px-4 py-2 font-black inline-flex items-center justify-center gap-2"><Download size={16}/> Descargar archivo</a>}
          {isPdf && openUrl && <button type="button" onClick={openPdfInNewTab} className="rounded-xl bg-slate-900 text-white px-4 py-2 font-black inline-flex items-center justify-center gap-2"><ExternalLink size={16}/> Abrir PDF</button>}
        </div>
      </div>
    </div>
  </BaseModal>
}

function PreviewFrame({ title, fileName, fileType, fileBase64, url }) {
  const [previewUrl, setPreviewUrl] = useState('')
  const isImage = (fileType || '').startsWith('image/')
  const isPdf = (fileType || '').includes('pdf') || (fileName || '').toLowerCase().endsWith('.pdf')

  useEffect(() => {
    let objectUrl = ''
    if (fileBase64) {
      try {
        const blob = dataUrlToBlob(fileBase64, fileType || (isPdf ? 'application/pdf' : 'application/octet-stream'))
        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      } catch {
        setPreviewUrl(fileBase64)
      }
    } else {
      setPreviewUrl(url || '')
    }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [fileBase64, fileType, url, isPdf])

  if (!previewUrl) return <UnsupportedFile fileName={fileName} />
  if (isImage) return <img src={previewUrl} alt={title || fileName || 'Archivo'} className="w-full max-h-[560px] object-contain bg-white rounded-xl border" />
  if (isPdf || url) return <iframe title={title || fileName || 'Vista previa'} src={previewUrl} className="w-full h-[560px] bg-white rounded-xl border" />
  return <UnsupportedFile fileName={fileName} />
}

function UnsupportedFile({ fileName }) {
  return <div className="bg-white min-h-[360px] p-10 text-center rounded-xl border"><BookOpen className="mx-auto text-blue-600" size={54}/><h3 className="mt-5 text-2xl font-black text-slate-900">Archivo cargado</h3><p className="mt-2 text-slate-500">Este formato no se puede mostrar dentro del navegador. Puedes descargarlo y abrirlo en tu equipo.</p><p className="mt-2 text-sm font-bold text-slate-600 break-words">{fileName}</p></div>
}

function dataUrlToBlob(dataUrl, fallbackType = 'application/octet-stream') {
  if (!dataUrl.startsWith('data:')) {
    const byteString = atob(dataUrl)
    const arrayBuffer = new ArrayBuffer(byteString.length)
    const intArray = new Uint8Array(arrayBuffer)
    for (let i = 0; i < byteString.length; i++) intArray[i] = byteString.charCodeAt(i)
    return new Blob([arrayBuffer], { type: fallbackType })
  }
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/data:(.*?);base64/)?.[1] || fallbackType
  const byteString = atob(base64 || '')
  const arrayBuffer = new ArrayBuffer(byteString.length)
  const intArray = new Uint8Array(arrayBuffer)
  for (let i = 0; i < byteString.length; i++) intArray[i] = byteString.charCodeAt(i)
  return new Blob([arrayBuffer], { type: mime })
}

function TaskModal({ item, course, close, submitted, onSubmitted }) {
  const [comentario, setComentario] = useState(submitted?.comentario || '')
  const [fileInfo, setFileInfo] = useState({ archivoNombre: submitted?.archivoNombre || '', archivoTipo: submitted?.archivoTipo || '', archivoBase64: submitted?.archivoBase64 || '' })
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  async function pickFile(e) { const file = e.target.files?.[0]; if (!file) return; setLoading(true); const base64 = await fileToDataUrl(file); setFileInfo({ archivoNombre:file.name, archivoTipo:file.type || 'application/octet-stream', archivoBase64:base64 }); setLoading(false) }
  async function submit(e) { e.preventDefault(); await api(`/api/estudiante/tareas/${item.id}/entregar`, { method:'POST', body: JSON.stringify({ comentario, ...fileInfo }) }); onSubmitted() }
  const teacherFile = item.archivoBase64 || item.urlArchivo
  return <BaseModal title={item.titulo} close={close}>
    {preview && <FilePreviewModal {...preview} close={() => setPreview(null)} />}
    <div className="space-y-5">
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-sm text-slate-700"><p><b>Indicaciones:</b> {item.descripcion || 'Sube tu entrega.'}</p><p className="mt-1"><b>Fecha limite:</b> {item.fechaLimite || item.fecha} • <b>Puntaje:</b> {item.puntaje}</p></div>
      {teacherFile && <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><p className="font-black text-slate-900">Documento de indicaciones del docente</p><p className="text-sm text-slate-500">{item.archivoNombre || item.urlArchivo}</p></div><div className="flex gap-2 flex-wrap"><button type="button" onClick={() => setPreview({ title:`Indicaciones - ${item.titulo}`, fileName:item.archivoNombre, fileType:item.archivoTipo, fileBase64:item.archivoBase64, url:item.urlArchivo, contenido:item.descripcion })} className="rounded-xl border border-blue-600 text-blue-700 px-4 py-2 font-black hover:bg-blue-50">Ver archivo</button>{item.archivoBase64 && <a href={item.archivoBase64} download={item.archivoNombre || 'indicaciones'} className="rounded-xl bg-blue-600 text-white px-4 py-2 font-black inline-flex items-center gap-2"><Download size={16}/> Descargar</a>}</div></div>}
      {submitted && <div className="rounded-2xl bg-green-50 border border-green-100 p-4 text-green-700 font-bold"><div className="flex items-center gap-2"><CheckCircle2 /> Ya entregaste esta tarea. Nota: {submitted.nota ?? 'pendiente'} / {item.puntaje}</div>{submitted.comentarioDocente ? <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700"><b>Comentario del docente:</b> {submitted.comentarioDocente}</p> : <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-500"><b>Comentario del docente:</b> Aun no hay comentario. Puedes escribirle por chat si necesitas que revise tu entrega.</p>}</div>}
      {submitted?.archivoBase64 && <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><p className="font-black text-slate-900">Archivo que enviaste</p><p className="text-sm text-slate-500">{submitted.archivoNombre}</p><p className="text-xs text-slate-400 mt-1">Puedes visualizarlo para comprobar si subiste el archivo correcto. Si te equivocaste, reemplazalo y vuelve a enviar.</p></div><div className="flex gap-2 flex-wrap"><button type="button" onClick={() => setPreview({ title:`Archivo enviado - ${item.titulo}`, fileName:submitted.archivoNombre, fileType:submitted.archivoTipo, fileBase64:submitted.archivoBase64, contenido:submitted.comentario })} className="rounded-xl border border-blue-600 text-blue-700 px-4 py-2 font-black hover:bg-blue-50">Ver mi archivo</button><a href={submitted.archivoBase64} download={submitted.archivoNombre || 'entrega'} className="rounded-xl bg-blue-600 text-white px-4 py-2 font-black inline-flex items-center gap-2"><Download size={16}/> Descargar</a><Link to={`/estudiante/chat?curso=${course?.id || ''}`} className="rounded-xl bg-slate-900 text-white px-4 py-2 font-black">Escribir al docente</Link></div></div>}
      <form onSubmit={submit} className="space-y-4"><label className="block"><span className="font-black text-slate-700 text-sm">Comentario de entrega</span><textarea value={comentario} onChange={e => setComentario(e.target.value)} required className="mt-2 w-full rounded-2xl border border-slate-200 p-4 focus:outline-none focus:ring-4 focus:ring-blue-100" rows="4" /></label><label className="block"><span className="font-black text-slate-700 text-sm">Archivo de entrega PDF, Word, PPT</span><input type="file" required={!submitted} accept=".pdf,.doc,.docx,.ppt,.pptx,image/*" onChange={pickFile} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" />{fileInfo.archivoNombre && <p className="mt-2 text-sm text-slate-600 font-bold">Archivo seleccionado: {fileInfo.archivoNombre}</p>}{loading && <p className="mt-2 text-sm text-blue-600 font-bold">Cargando archivo...</p>}</label>{fileInfo.archivoBase64 && <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><p className="font-black text-slate-900">Archivo preparado para enviar</p><p className="text-sm text-slate-500">{fileInfo.archivoNombre}</p></div><button type="button" onClick={() => setPreview({ title:`Vista previa antes de enviar - ${item.titulo}`, fileName:fileInfo.archivoNombre, fileType:fileInfo.archivoTipo, fileBase64:fileInfo.archivoBase64, contenido:comentario })} className="rounded-xl border border-blue-600 text-blue-700 px-4 py-2 font-black hover:bg-blue-50">Previsualizar antes de enviar</button></div>}<button className="w-full rounded-2xl bg-blue-600 text-white py-3.5 font-black hover:bg-blue-700 transition"><Upload className="inline mr-2" size={18}/> {submitted ? 'Reemplazar / actualizar entrega' : 'Enviar entrega'}</button></form>
    </div>
  </BaseModal>
}

function TeacherTaskModal({ item, close }) {
  const [entregas, setEntregas] = useState(null)
  const [nota, setNota] = useState({})
  const [comentario, setComentario] = useState({})
  const [preview, setPreview] = useState(null)
  const [status, setStatus] = useState('')
  useEffect(() => { api(`/api/docente/tareas/${item.id}/entregas`).then(setEntregas).catch(e=>setStatus(e.message)) }, [item.id])
  async function grade(entrega) { const saved = await api(`/api/docente/entregas/${entrega.id}/calificar`, { method:'PUT', body: JSON.stringify({ nota: Number(nota[entrega.id] ?? entrega.nota ?? 0), comentarioDocente: comentario[entrega.id] ?? entrega.comentarioDocente ?? '' }) }); setEntregas(prev => prev.map(e => e.id === saved.id ? saved : e)); setStatus('Nota y comentario guardados. El estudiante ya puede verlo.') }
  return <BaseModal title={`Entregas - ${item.titulo}`} close={close}>
    {preview && <FilePreviewModal {...preview} close={() => setPreview(null)} />}
    <div className="space-y-4">{status && <p className="rounded-2xl bg-blue-50 p-3 font-bold text-blue-700">{status}</p>}{entregas === null ? <p className="text-slate-500 font-bold">Cargando entregas reales...</p> : entregas.length === 0 ? <div className="rounded-3xl bg-slate-50 border p-6 text-center text-slate-500 font-bold">Todavia ningun estudiante matriculado entrego esta tarea.</div> : entregas.map(entrega => <div key={entrega.id} className="rounded-2xl bg-slate-50 border p-4"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><p className="font-black text-slate-900">{entrega.estudiante?.nombres} {entrega.estudiante?.apellidos}</p><p className="text-sm text-slate-500">{entrega.archivoNombre || 'Sin archivo'} • {entrega.estado} • Nota actual: {entrega.nota ?? 'pendiente'}</p><p className="text-sm text-slate-600 mt-1">Comentario alumno: {entrega.comentario || 'Sin comentario'}</p>{entrega.comentarioDocente && <p className="text-sm text-blue-700 mt-1"><b>Tu comentario:</b> {entrega.comentarioDocente}</p>}</div><div className="flex gap-2 flex-wrap">{entrega.archivoBase64 && <><button type="button" onClick={() => setPreview({ title:`Entrega de ${entrega.estudiante?.nombres}`, fileName:entrega.archivoNombre, fileType:entrega.archivoTipo, fileBase64:entrega.archivoBase64, contenido:entrega.comentario })} className="rounded-xl border border-blue-600 text-blue-700 px-4 py-2 font-black hover:bg-blue-50">Ver archivo</button><a download={entrega.archivoNombre || 'entrega.pdf'} href={entrega.archivoBase64} className="rounded-xl bg-slate-900 text-white px-4 py-2 font-black flex items-center gap-2"><Download size={16}/> Descargar</a></>}<input type="number" min="0" max={item.puntaje || 20} value={nota[entrega.id] ?? entrega.nota ?? ''} onChange={e=>setNota({...nota,[entrega.id]:e.target.value})} placeholder="Nota" className="w-24 rounded-xl border px-3 py-2"/><button onClick={()=>grade(entrega)} className="rounded-xl bg-blue-600 text-white px-4 py-2 font-black">Calificar</button></div></div><textarea value={comentario[entrega.id] ?? entrega.comentarioDocente ?? ''} onChange={e=>setComentario({...comentario,[entrega.id]:e.target.value})} placeholder="Comentario del docente para el estudiante" className="mt-3 w-full rounded-xl border px-3 py-2" /></div>)}</div>
  </BaseModal>
}

function TeacherEvaluationModal({ item, close }) {
  const [respuestas, setRespuestas] = useState(null)
  const [nota, setNota] = useState({})
  const [comentario, setComentario] = useState({})
  const [status, setStatus] = useState('')
  async function load(){ api(`/api/docente/evaluaciones/${item.id}/respuestas`).then(setRespuestas).catch(e=>setStatus(e.message)) }
  useEffect(() => { load() }, [item.id])
  async function grade(r) {
    const saved = await api(`/api/docente/respuestas/${r.id}/calificar`, { method:'PUT', body: JSON.stringify({ nota: Number(nota[r.id] ?? r.puntaje ?? 0), comentarioDocente: comentario[r.id] || r.comentarioDocente || '' }) })
    setRespuestas(prev => prev.map(x => x.id === saved.id ? saved : x))
    setStatus('Nota de evaluacion actualizada. El estudiante ya puede ver su resultado.')
  }
  async function authorize(r) {
    const saved = await api(`/api/docente/respuestas/${r.id}/autorizar`, { method:'PUT' })
    setRespuestas(prev => prev.map(x => x.id === saved.id ? saved : x))
    setStatus('Nuevo intento autorizado para el estudiante.')
  }
  return <BaseModal title={`Respuestas - ${item.titulo}`} close={close}><div className="space-y-3">{status && <p className="rounded-2xl bg-blue-50 p-3 font-bold text-blue-700">{status}</p>}{respuestas === null ? <p className="text-slate-500 font-bold">Cargando respuestas reales...</p> : respuestas.length === 0 ? <div className="rounded-3xl bg-slate-50 border p-6 text-center text-slate-500 font-bold">Todavia ningun estudiante matriculado resolvio esta evaluacion.</div> : respuestas.map(r => <div key={r.id} className="rounded-2xl bg-slate-50 border p-4"><div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><p className="font-black text-slate-900">{r.estudiante?.nombres} {r.estudiante?.apellidos}</p><p className="text-sm text-slate-500">Intento {r.intento || 1} • {r.estado} • {r.fechaEnvio}</p><p className="text-xs text-slate-400 mt-1">Tiempo usado: {r.tiempoUsadoSegundos ? Math.round(r.tiempoUsadoSegundos/60) : 0} min • Intentos extra autorizados: {r.intentosAutorizados || 0}</p><p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.respuestasJson}</p></div><div className="flex gap-2 items-center flex-wrap"><input type="number" min="0" max={item.puntaje || 20} value={nota[r.id] ?? r.puntaje ?? ''} onChange={e=>setNota({...nota,[r.id]:e.target.value})} className="w-24 rounded-xl border px-3 py-2"/><button onClick={()=>grade(r)} className="rounded-xl bg-blue-600 text-white px-4 py-2 font-black">Guardar nota</button><button onClick={()=>authorize(r)} className="rounded-xl bg-green-600 text-white px-4 py-2 font-black">Autorizar otro intento</button></div></div><textarea value={comentario[r.id] ?? r.comentarioDocente ?? ''} onChange={e=>setComentario({...comentario,[r.id]:e.target.value})} placeholder="Comentario del docente" className="mt-3 w-full rounded-xl border px-3 py-2" /></div>)}</div></BaseModal>
}


function EvaluationModal({ item, course, close, result, onFinished }) {
  const [answers, setAnswers] = useState({})
  const [secondsLeft, setSecondsLeft] = useState((item.duracionMinutos || 30) * 60)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(false)
  const questions = useMemo(() => getEvaluationQuestions(item, course), [item?.id, item?.preguntasJson, course?.id])

  useEffect(() => {
    if (result && !retry) return
    if (secondsLeft <= 0) { finish(true); return }
    const timer = setTimeout(() => setSecondsLeft(s => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, result, retry])

  useEffect(() => { if (retry) { setAnswers({}); setSecondsLeft((item.duracionMinutos || 30) * 60) } }, [retry])

  if (result && !retry) {
    const permitidos = (item.intentos || 1) + (result.intentosAutorizados || 0)
    const bloqueado = (result.intento || 1) >= permitidos
    return <BaseModal title="Resultado de evaluacion" close={close}><div className="rounded-3xl bg-green-50 border border-green-100 p-6 text-center"><CheckCircle2 className="mx-auto text-green-600 mb-3" size={52}/><h3 className="text-2xl font-black text-green-800">Evaluacion enviada</h3><p className="mt-2 text-green-700">Nota: {result.puntaje ?? 'pendiente'} / {item.puntaje || 20}</p><p className="mt-1 text-sm text-green-700">Estado: {result.estado}. Intentos usados: {result.intento || 1} de {permitidos}.</p>{result.comentarioDocente && <p className="mt-3 rounded-2xl bg-white p-3 text-sm text-slate-600"><b>Comentario docente:</b> {result.comentarioDocente}</p>}{bloqueado ? <p className="mt-4 text-sm font-bold text-red-600">No puedes repetir la evaluacion hasta que el docente autorice otro intento.</p> : <button onClick={() => setRetry(true)} className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 text-white font-black">Iniciar intento autorizado</button>}</div></BaseModal>
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  async function finish(auto = false) {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      const tiempoUsadoSegundos = ((item.duracionMinutos || 30) * 60) - Math.max(secondsLeft, 0)
      await api(`/api/estudiante/evaluaciones/${item.id}/resolver`, { method:'POST', body: JSON.stringify({ answers, tiempoUsadoSegundos, finalizadoPorTiempo: auto }) })
      onFinished()
    } catch (e) {
      setError(e.message || 'No se pudo enviar la evaluacion')
      setSubmitting(false)
    }
  }
  return <BaseModal title={item.titulo} close={close}><div className="space-y-5"><div className={`rounded-2xl border p-4 text-sm font-black ${secondsLeft <= 60 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-yellow-50 border-yellow-100 text-slate-700'}`}>Tiempo restante: {mm}:{ss} • Duracion: {item.duracionMinutos || 30} min • Intentos permitidos: {item.intentos || 1}</div>{error && <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-red-700 font-bold">{error}</div>}{questions.map((q,i) => <div key={q.texto + i} className="rounded-2xl bg-slate-50 border p-4"><p className="font-black text-slate-900">{i+1}. {q.texto}</p><div className="mt-3 grid sm:grid-cols-2 gap-2">{(q.opciones || ['Verdadero','Falso']).map(op => <button key={op} type="button" onClick={() => setAnswers({...answers,[i]:op})} className={`rounded-xl border px-4 py-2 font-bold ${answers[i]===op?'bg-blue-600 text-white':'bg-white'}`}>{op}</button>)}</div></div>)}<button disabled={submitting} onClick={() => finish(false)} className="w-full rounded-2xl bg-blue-600 text-white py-3.5 font-black hover:bg-blue-700 disabled:opacity-60">{submitting ? 'Enviando...' : 'Finalizar evaluacion'}</button></div></BaseModal>
}

function getEvaluationQuestions(item, course) {
  try {
    if (item?.preguntasJson) {
      const parsed = JSON.parse(item.preguntasJson)
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {}
  const name = `${course?.nombre || ''} ${item?.titulo || ''}`.toLowerCase()
  if (name.includes('calculo') || name.includes('integral')) {
    return [
      { texto:'La integral definida permite calcular areas bajo una curva en un intervalo.', opciones:['Verdadero','Falso'], correcta:'Verdadero' },
      { texto:'La regla de sustitucion se usa para simplificar integrales mediante un cambio de variable.', opciones:['Verdadero','Falso'], correcta:'Verdadero' },
      { texto:'La derivada de una funcion siempre es igual a su integral indefinida.', opciones:['Verdadero','Falso'], correcta:'Falso' }
    ]
  }
  if (name.includes('fisica') || name.includes('cinematica')) {
    return [
      { texto:'La aceleracion representa el cambio de velocidad respecto al tiempo.', opciones:['Verdadero','Falso'], correcta:'Verdadero' },
      { texto:'La fuerza neta se relaciona con masa y aceleracion segun la segunda ley de Newton.', opciones:['Verdadero','Falso'], correcta:'Verdadero' },
      { texto:'Un cuerpo sin fuerza neta necesariamente esta acelerando.', opciones:['Verdadero','Falso'], correcta:'Falso' }
    ]
  }
  if (name.includes('seguridad')) {
    return [
      { texto:'La confidencialidad busca evitar accesos no autorizados a la informacion.', opciones:['Verdadero','Falso'], correcta:'Verdadero' },
      { texto:'Una contrasena segura debe ser corta y facil de adivinar.', opciones:['Verdadero','Falso'], correcta:'Falso' },
      { texto:'El cifrado ayuda a proteger datos durante su almacenamiento o transmision.', opciones:['Verdadero','Falso'], correcta:'Verdadero' }
    ]
  }
  return [
    { texto:'Spring Boot se usa principalmente para crear el backend de una aplicacion web.', opciones:['Verdadero','Falso'], correcta:'Verdadero' },
    { texto:'JPA permite mapear clases Java con tablas de base de datos.', opciones:['Verdadero','Falso'], correcta:'Verdadero' },
    { texto:'React se ejecuta dentro de la base de datos.', opciones:['Verdadero','Falso'], correcta:'Falso' }
  ]
}


function ZoomModal({ item, close }) { return <BaseModal title={item.titulo} close={close}><div className="rounded-3xl bg-slate-50 border p-6"><p className="font-black text-slate-900">Fecha: {item.fecha} • Hora: {item.hora}</p><p className="mt-2 text-slate-600">ID de reunion: {item.salaId || item.codigo || 'SAU-ZOOM'}</p><div className="mt-6 flex gap-3 flex-wrap"><a href={item.enlace || '#'} target="_blank" rel="noreferrer" className="rounded-2xl bg-blue-600 text-white px-5 py-3 font-black flex items-center gap-2"><ExternalLink size={18}/> Unirse al Zoom</a><a href={item.grabacion || '#'} target="_blank" rel="noreferrer" className="rounded-2xl bg-slate-900 text-white px-5 py-3 font-black">Ver grabacion</a></div></div></BaseModal> }
function AnnouncementEditorModal({ cursoId, close, onSaved }) {
  const [form, setForm] = useState({ titulo:'', mensaje:'' })
  const [error, setError] = useState('')
  async function save(e) {
    e.preventDefault(); setError('')
    try { await api('/api/docente/anuncios', { method:'POST', body: JSON.stringify({ cursoId, titulo:form.titulo, mensaje:form.mensaje, descripcion:form.mensaje }) }); onSaved() }
    catch (e) { setError(e.message || 'No se pudo publicar el anuncio') }
  }
  return <BaseModal title="Publicar anuncio" close={close}><form onSubmit={save} className="space-y-4">{error && <p className="rounded-2xl bg-red-50 p-3 text-red-700 font-bold">{error}</p>}<Input label="Titulo" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})}/><label className="block"><span className="text-sm font-black text-slate-700">Mensaje para estudiantes</span><textarea required rows="5" value={form.mensaje} onChange={e=>setForm({...form,mensaje:e.target.value})} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" /></label><button className="w-full rounded-2xl bg-blue-600 text-white py-3.5 font-black hover:bg-blue-700">Publicar anuncio</button></form></BaseModal>
}

function AnnouncementModal({ item, close }) { return <BaseModal title={item.titulo} close={close}><div className="rounded-3xl bg-blue-50 border border-blue-100 p-6"><p className="text-sm font-bold text-blue-700">Publicado: {item.fechaPublicacion || item.fecha}</p><p className="mt-4 text-slate-700 leading-relaxed">{item.mensaje}</p></div></BaseModal> }
function Input({ label, type='text', ...props }) { return <label className="block"><span className="text-sm font-black text-slate-700">{label}</span><input type={type} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" {...props}/></label> }
function fileToDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file) }) }
