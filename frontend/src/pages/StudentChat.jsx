import { BookOpen, Download, FileText, Mail, MessageCircle, Paperclip, Plus, Search, Send, Users } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { api, normalizeCourses } from '../api/client.js'

function initials(name = '') {
  const parts = name.trim().split(' ').filter(Boolean)
  return (parts[0]?.[0] || 'U') + (parts[1]?.[0] || '')
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function prettyDate(value) {
  if (!value || value === 'Nuevo') return 'Nuevo'
  try {
    const d = new Date(value)
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
  } catch {
    return value
  }
}

export default function StudentChat({ role = 'ESTUDIANTE' }) {
  const [courses, setCourses] = useState([])
  const [courseId, setCourseId] = useState('')
  const [conversations, setConversations] = useState([])
  const [contacts, setContacts] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState('conversaciones')
  const [status, setStatus] = useState('Cargando chat academico...')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const selectedCourse = useMemo(() => courses.find(c => String(c.id) === String(courseId)), [courses, courseId])

  async function loadBase() {
    const [courseRes, convRes] = await Promise.all([
      api('/api/chat/cursos'),
      api('/api/chat/conversaciones')
    ])
    const normalized = normalizeCourses(courseRes || [])
    setCourses(normalized)
    setCourseId(prev => prev || normalized[0]?.id || '')
    setConversations(convRes || [])
    if ((convRes || []).length > 0) {
      await openConversation(convRes[0])
    }
    setStatus('Listo para comunicarte con docentes y companeros')
  }

  useEffect(() => {
    loadBase().catch(e => setStatus(e.message || 'No se pudo cargar el chat'))
  }, [])

  async function searchContacts(nextQuery = query, nextCourseId = courseId) {
    if (!nextCourseId) return
    setMode('buscar')
    const params = new URLSearchParams({ cursoId: String(nextCourseId), q: nextQuery || '' })
    const res = await api(`/api/chat/contactos?${params.toString()}`)
    setContacts(res || [])
  }

  async function openConversation(contact) {
    setSelected(contact)
    setMode('conversaciones')
    const params = new URLSearchParams({ cursoId: String(contact.cursoId), usuarioId: String(contact.id) })
    const res = await api(`/api/chat/mensajes?${params.toString()}`)
    setMessages(res || [])
  }

  async function send() {
    if (!text.trim() || !selected) return
    const saved = await api('/api/chat/mensajes', {
      method: 'POST',
      body: JSON.stringify({ cursoId: selected.cursoId, receptorId: selected.id, texto: text })
    })
    setMessages(prev => [...prev, saved])
    setText('')
    const convRes = await api('/api/chat/conversaciones')
    setConversations(convRes || [])
  }

  function handleCourseChange(value) {
    setCourseId(value)
    searchContacts(query, value).catch(e => setStatus(e.message))
  }

  function handleQueryChange(value) {
    setQuery(value)
    searchContacts(value, courseId).catch(e => setStatus(e.message))
  }

  function attachFile() {
    if (!selected) {
      setStatus('Primero selecciona una conversacion')
      return
    }
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !selected) return
    const maxMb = 8
    if (file.size > maxMb * 1024 * 1024) {
      setStatus(`El archivo supera ${maxMb} MB. Usa un archivo mas liviano para este proyecto academico.`)
      return
    }
    setUploading(true)
    try {
      const base64 = await fileToDataUrl(file)
      const saved = await api('/api/chat/mensajes', {
        method: 'POST',
        body: JSON.stringify({
          cursoId: selected.cursoId,
          receptorId: selected.id,
          texto: text.trim() ? text.trim() : `Te envio el archivo: ${file.name}`,
          archivoNombre: file.name,
          archivoTipo: file.type || 'application/octet-stream',
          archivoBase64: base64
        })
      })
      setMessages(prev => [...prev, saved])
      setText('')
      const convRes = await api('/api/chat/conversaciones')
      setConversations(convRes || [])
      setStatus('Archivo enviado correctamente')
    } catch (err) {
      setStatus(err.message || 'No se pudo enviar el archivo')
    } finally {
      setUploading(false)
    }
  }

  const isTeacher = role === 'DOCENTE'

  return (
    <DashboardLayout role={role} title={isTeacher ? 'Chat docente' : 'Chat academico'} subtitle={isTeacher ? 'Comunicate con tus estudiantes por curso y seccion' : 'Comunicate con docentes, estudiantes o companeros de tus cursos'}>
      <section className="grid xl:grid-cols-[430px_1fr] gap-4 xl:gap-6 xl:h-[calc(100vh-190px)] xl:min-h-[680px]">
        <aside className="rounded-[2rem] bg-white border border-slate-100 shadow-card overflow-hidden flex flex-col max-h-[420px] xl:max-h-none">
          <div className="p-4 sm:p-5 border-b space-y-4">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-black text-slate-900 flex items-center gap-2"><MessageCircle size={18}/> Chat</h2>
                <p className="text-xs text-slate-500 mt-1">{status}</p>
              </div>
              <button onClick={() => { setMode('buscar'); searchContacts().catch(e => setStatus(e.message)) }} className="rounded-2xl bg-blue-600 text-white px-3 sm:px-4 py-2 text-sm font-black hover:bg-blue-700 transition flex items-center gap-2 shrink-0 whitespace-nowrap"><Plus size={16}/> Crear</button>
            </div>

            {mode === 'buscar' && (
              <div className="rounded-3xl bg-blue-50 border border-blue-100 p-4 space-y-3">
                <label className="block">
                  <span className="text-xs font-black text-slate-700 uppercase">Selecciona curso o seccion</span>
                  <select value={courseId} onChange={e => handleCourseChange(e.target.value)} className="mt-2 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100">
                    {courses.map(c => <option key={c.id} value={c.id}>{c.nombre} - {c.codigo}</option>)}
                  </select>
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                  <input value={query} onChange={e => handleQueryChange(e.target.value)} className="w-full rounded-2xl bg-white border border-blue-100 py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-blue-100" placeholder="Buscar por nombre, correo o rol" />
                </div>
              </div>
            )}

            {mode !== 'buscar' && (
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-slate-400" size={18}/>
                <input onFocus={() => { setMode('buscar'); searchContacts().catch(e => setStatus(e.message)) }} className="w-full rounded-2xl bg-slate-50 border border-slate-100 py-3 pl-11 pr-4 outline-none focus:ring-4 focus:ring-blue-100" placeholder="Buscar conversacion o crear una nueva" />
              </div>
            )}
          </div>

          <div className="divide-y overflow-y-auto flex-1 min-h-0">
            {mode === 'buscar' ? (
              contacts.length === 0 ? <Empty text="Busca a un docente o companero matriculado en el curso seleccionado." /> : contacts.map(c => <ContactButton key={`${c.cursoId}-${c.id}`} contact={c} selected={selected} onClick={() => openConversation(c)} />)
            ) : (
              conversations.length === 0 ? <Empty text="Todavia no tienes conversaciones. Presiona Crear para buscar por curso." /> : conversations.map(c => <ContactButton key={`${c.cursoId}-${c.id}`} contact={c} selected={selected} onClick={() => openConversation(c)} />)
            )}
          </div>
        </aside>

        <main className="rounded-[2rem] bg-white border border-slate-100 shadow-card flex flex-col overflow-hidden min-h-[520px] xl:min-h-0">
          {selected ? (
            <>
              <header className="p-4 sm:p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black shrink-0">{initials(selected.nombreCompleto)}</div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 break-words">{selected.nombreCompleto}</h2>
                    <p className="text-sm text-slate-500 flex flex-wrap items-center gap-2"><BookOpen size={15}/> {selected.cursoNombre} <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-black">{selected.rol}</span></p>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${selected.enLinea ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{selected.enLinea ? 'En linea' : 'No disponible'}</span>
              </header>

              <div className="flex-1 p-3 sm:p-6 space-y-4 bg-slate-50 overflow-y-auto min-h-[300px]">
                {messages.length === 0 && <div className="h-full flex items-center justify-center text-center"><div><div className="mx-auto w-16 h-16 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4"><MessageCircle /></div><p className="font-black text-slate-900">Inicia la conversacion</p><p className="text-sm text-slate-500 mt-1">Los mensajes quedan disponibles dentro del curso.</p></div></div>}
                {messages.map((m) => (
                  <div key={m.id || `${m.fechaHora}-${m.texto}`} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-xl rounded-3xl px-4 sm:px-5 py-3 sm:py-4 text-sm font-medium shadow-sm break-words ${m.from === 'me' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-white text-slate-700 rounded-bl-md border'}`}>
                      <p>{m.texto}</p>
                      {m.archivoBase64 && (
                        <div className={`mt-3 rounded-2xl p-3 border ${m.from === 'me' ? 'bg-white/10 border-white/20' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.from === 'me' ? 'bg-white/15' : 'bg-blue-50 text-blue-700'}`}><FileText size={20}/></div>
                            <div className="min-w-0 flex-1">
                              <p className="font-black truncate">{m.archivoNombre}</p>
                              <p className={`text-xs ${m.from === 'me' ? 'text-blue-100' : 'text-slate-500'}`}>{m.archivoTipo || 'Archivo adjunto'}</p>
                            </div>
                            <a href={m.archivoBase64} download={m.archivoNombre || 'archivo'} className={`rounded-xl px-3 py-2 font-black inline-flex items-center gap-2 ${m.from === 'me' ? 'bg-white text-blue-700' : 'bg-slate-900 text-white'}`}><Download size={15}/> Descargar</a>
                          </div>
                        </div>
                      )}
                      <p className={`text-[10px] mt-2 ${m.from === 'me' ? 'text-blue-100' : 'text-slate-400'}`}>{prettyDate(m.fechaHora)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 sm:p-5 border-t flex gap-2 sm:gap-3">
                <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,image/*" onChange={handleFileChange} />
                <button title="Adjuntar PDF, Word, PPT, imagen o ZIP" onClick={attachFile} disabled={uploading} className="rounded-2xl bg-slate-100 p-3 text-slate-600 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60 shrink-0"><Paperclip /></button>
                <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-3 sm:px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" placeholder={uploading ? 'Subiendo archivo...' : 'Escribir mensaje'} />
                <button onClick={send} className="rounded-2xl bg-blue-600 px-4 sm:px-5 text-white hover:bg-blue-700 shrink-0"><Send /></button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <div className="mx-auto w-20 h-20 rounded-[2rem] bg-blue-100 text-blue-700 flex items-center justify-center mb-5"><Users size={34}/></div>
                <h2 className="text-2xl font-black text-slate-900">Selecciona o crea un chat</h2>
                <p className="text-slate-500 mt-2 max-w-md">Puedes buscar por curso y escribirle a una persona matriculada o asignada al curso. Los mensajes quedan registrados dentro del aula.</p>
              </div>
            </div>
          )}
        </main>
      </section>
    </DashboardLayout>
  )
}

function ContactButton({ contact, selected, onClick }) {
  const active = selected?.id === contact.id && String(selected?.cursoId) === String(contact.cursoId)
  return (
    <button onClick={onClick} className={`w-full text-left p-4 sm:p-5 hover:bg-slate-50 transition ${active ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black shrink-0">{initials(contact.nombreCompleto)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-2 min-w-0">
            <p className="font-black text-slate-900 truncate text-sm sm:text-base">{contact.nombreCompleto}</p>
            <span className="text-xs font-bold text-slate-400 shrink-0">{prettyDate(contact.fecha)}</span>
          </div>
          <p className="text-xs font-bold text-blue-700 mt-1 truncate">{contact.cursoNombre}</p>
          <p className="text-sm text-slate-500 mt-1 line-clamp-1">{contact.ultimoMensaje}</p>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 truncate"><Mail size={12}/> {contact.correo}</p>
        </div>
      </div>
    </button>
  )
}

function Empty({ text }) {
  return <div className="p-8 text-center text-sm text-slate-500">{text}</div>
}
