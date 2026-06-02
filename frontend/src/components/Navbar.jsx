import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, CheckCircle2, Menu, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

function texto(value) {
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function coincide(item, q) {
  const filtro = texto(q)
  if (!filtro) return true
  return texto([item.title, item.subtitle, item.meta, item.type].join(' ')).includes(filtro)
}

function result(type, title, subtitle, meta, path) {
  return { id: `${type}-${path}-${title}-${subtitle}`, type, title, subtitle, meta, path }
}

export default function Navbar({ title, subtitle }) {
  const user = JSON.parse(localStorage.getItem('sau_user') || '{}')
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [allResults, setAllResults] = useState([])
  const [notifications, setNotifications] = useState([])
  const navigate = useNavigate()
  const boxRef = useRef(null)

  useEffect(() => {
    function clickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', clickOutside)
    return () => document.removeEventListener('mousedown', clickOutside)
  }, [])

  useEffect(() => {
    let alive = true
    async function loadNotifications() {
      try {
        if (!user.rol || user.rol === 'ADMIN') return
        const endpoint = user.rol === 'DOCENTE' ? '/api/docente/notificaciones' : '/api/estudiante/notificaciones'
        const data = await api(endpoint)
        if (alive) setNotifications(data || [])
      } catch (e) {
        if (alive) setNotifications([])
      }
    }
    loadNotifications()
    const timer = setInterval(loadNotifications, 10000)
    return () => { alive = false; clearInterval(timer) }
  }, [user.rol])

  async function buildSearchIndex() {
    if (!user.rol) return []
    const items = []

    if (user.rol === 'ADMIN') {
      const data = await api('/api/admin/reportes')
      ;(data.estudiantes || []).forEach(u => items.push(result('Estudiante', `${u.nombres || ''} ${u.apellidos || ''}`.trim(), u.correo, u.estado || 'Usuario registrado', '/admin/usuarios')))
      ;(data.docentes || []).forEach(u => items.push(result('Docente', `${u.nombres || ''} ${u.apellidos || ''}`.trim(), u.correo, u.especialidad || 'Docente registrado', '/admin/usuarios')))
      ;(data.cursos || []).forEach(c => items.push(result('Curso', c.nombre, `${c.codigo || ''} · ${c.modalidad || ''}`, `Docente: ${c.docente?.nombres || ''} ${c.docente?.apellidos || ''}`, '/admin/cursos')))
      ;(data.inscripciones || []).forEach(i => items.push(result('Inscripcion', i.estudiante ? `${i.estudiante.nombres} ${i.estudiante.apellidos}` : 'Estudiante', i.curso?.nombre || 'Curso', i.estado || 'Matriculado', '/admin/cursos')))
      ;(data.reclamos || []).forEach(r => items.push(result('Reclamo', r.asunto, `${r.usuario?.nombres || 'Usuario'} · ${r.estado || 'Pendiente'}`, r.descripcion, '/admin/reportes')))
      items.push(result('Modulo', 'Gestion de usuarios', 'Crear, editar, activar, desactivar o eliminar usuarios', 'Admin', '/admin/usuarios'))
      items.push(result('Modulo', 'Gestion de cursos', 'Crear cursos, asignar docentes y matricular estudiantes', 'Admin', '/admin/cursos'))
      items.push(result('Modulo', 'Reportes administrativos', 'Reclamos, estudiantes, docentes, cursos e inscripciones', 'Admin', '/admin/reportes'))
      return items
    }

    if (user.rol === 'DOCENTE') {
      const data = await api('/api/docente/dashboard')
      const cursos = data.cursos || []
      cursos.forEach(c => items.push(result('Curso', c.nombre, `${c.codigo || ''} · ${c.modalidad || ''}`, c.horario || 'Curso dictado', `/docente/curso/${c.id}`)))
      for (const c of cursos) {
        try {
          const d = await api(`/api/docente/cursos/${c.id}`)
          ;(d.materiales || []).forEach(m => items.push(result('Material', m.titulo, c.nombre, m.archivoNombre || m.urlArchivo || 'Contenido', `/docente/curso/${c.id}?tab=Contenido`)))
          ;(d.tareas || []).forEach(t => items.push(result('Tarea', t.titulo, c.nombre, t.estado || 'Tarea creada', `/docente/curso/${c.id}?tab=Tareas`)))
          ;(d.evaluaciones || []).forEach(ev => items.push(result('Evaluacion', ev.titulo, c.nombre, `${ev.duracionMinutos || 0} min · ${ev.intentos || 1} intento(s)`, `/docente/curso/${c.id}?tab=Evaluaciones`)))
          ;(d.zoom || []).forEach(z => items.push(result('Zoom', z.titulo, c.nombre, `${z.fecha || ''} ${z.hora || ''}`, `/docente/curso/${c.id}?tab=Zoom`)))
          ;(d.anuncios || []).forEach(a => items.push(result('Anuncio', a.titulo, c.nombre, a.mensaje || a.descripcion || 'Anuncio publicado', `/docente/curso/${c.id}?tab=Anuncios`)))
          ;(d.estudiantes || []).forEach(e => items.push(result('Estudiante', `${e.nombres || ''} ${e.apellidos || ''}`.trim(), e.correo, `Matriculado en ${c.nombre}`, `/docente/chat`)))
        } catch (_) {}
      }
      ;(await api('/api/docente/reportes').catch(() => [])).forEach(r => items.push(result('Reporte', r.asunto, r.estado || 'Pendiente', r.descripcion, '/docente/reportes')))
      items.push(result('Modulo', 'Horario y salones', 'Consulta horario de tus cursos', 'Docente', '/docente/horario'))
      items.push(result('Modulo', 'Chat', 'Comunicate con estudiantes de tus cursos', 'Docente', '/docente/chat'))
      items.push(result('Modulo', 'Evaluaciones', 'Crea, edita y revisa evaluaciones', 'Docente', '/docente/evaluaciones'))
      items.push(result('Modulo', 'Zoom', 'Programa clases y grabaciones', 'Docente', '/docente/zoom'))
      return items
    }

    const data = await api('/api/estudiante/dashboard')
    const cursos = data.cursos || []
    cursos.forEach(c => items.push(result('Curso', c.nombre, `${c.codigo || ''} · ${c.modalidad || ''}`, c.docente ? `Docente: ${c.docente.nombres || c.docente}` : 'Curso matriculado', `/estudiante/curso/${c.id}`)))
    for (const c of cursos) {
      try {
        const d = await api(`/api/estudiante/cursos/${c.id}`)
        ;(d.materiales || []).forEach(m => items.push(result('Material', m.titulo, c.nombre, m.archivoNombre || m.urlArchivo || 'Contenido', `/estudiante/curso/${c.id}?tab=Contenido`)))
        ;(d.tareas || []).forEach(t => items.push(result('Tarea', t.titulo, c.nombre, t.estado || 'Por entregar', `/estudiante/curso/${c.id}?tab=Tareas`)))
        ;(d.evaluaciones || []).forEach(ev => items.push(result('Evaluacion', ev.titulo, c.nombre, `${ev.duracionMinutos || 0} min · ${ev.intentos || 1} intento(s)`, `/estudiante/curso/${c.id}?tab=Evaluaciones`)))
        ;(d.zoom || []).forEach(z => items.push(result('Zoom', z.titulo, c.nombre, `${z.fecha || ''} ${z.hora || ''}`, `/estudiante/curso/${c.id}?tab=Zoom`)))
        ;(d.anuncios || []).forEach(a => items.push(result('Anuncio', a.titulo, c.nombre, a.mensaje || a.descripcion || 'Anuncio publicado', `/estudiante/curso/${c.id}?tab=Anuncios`)))
      } catch (_) {}
    }
    ;(await api('/api/estudiante/reportes').catch(() => [])).forEach(r => items.push(result('Reporte', r.asunto, r.estado || 'Pendiente', r.descripcion, '/estudiante/reportes')))
    items.push(result('Modulo', 'Calendario', 'Horario semanal y actividades', 'Estudiante', '/estudiante/calendario'))
    items.push(result('Modulo', 'Chat', 'Comunicate con docentes y compañeros', 'Estudiante', '/estudiante/chat'))
    items.push(result('Modulo', 'Reportes', 'Envia reclamos o incidencias', 'Estudiante', '/estudiante/reportes'))
    items.push(result('Modulo', 'Ayuda', 'Preguntas frecuentes y soporte', 'Estudiante', '/estudiante/ayuda'))
    return items
  }

  async function openSearch() {
    setSearchOpen(true)
    if (allResults.length > 0) return
    setSearchLoading(true)
    try {
      setAllResults(await buildSearchIndex())
    } catch (e) {
      setAllResults([result('Error', 'No se pudo completar la busqueda', e.message, 'Intenta nuevamente en unos segundos', '#')])
    } finally {
      setSearchLoading(false)
    }
  }

  const filtered = useMemo(() => allResults.filter(item => coincide(item, searchText)).slice(0, 12), [allResults, searchText])

  const mobileMenu = useMemo(() => {
    if (user.rol === 'ADMIN') return [
      ['Panel', '/admin'], ['Usuarios', '/admin/usuarios'], ['Cursos', '/admin/cursos'], ['Reportes', '/admin/reportes'], ['Configuracion', '/admin/configuracion']
    ]
    if (user.rol === 'DOCENTE') return [
      ['Inicio', '/docente'], ['Horario', '/docente/horario'], ['Chat', '/docente/chat'], ['Reportes', '/docente/reportes'], ['Evaluaciones', '/docente/evaluaciones'], ['Zoom', '/docente/zoom'], ['Configuracion', '/docente/configuracion']
    ]
    return [
      ['Inicio', '/estudiante'], ['Calendario', '/estudiante/calendario'], ['Chat', '/estudiante/chat'], ['Reportes', '/estudiante/reportes'], ['Ayuda', '/estudiante/ayuda']
    ]
  }, [user.rol])

  function go(path) {
    if (!path || path === '#') return
    setSearchOpen(false)
    setSearchText('')
    navigate(path)
  }

  return (
    <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200">
      <div className="px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <div className="min-w-0">
            <h2 className="text-base sm:text-2xl font-black text-slate-900 leading-tight break-words">{title}</h2>
            {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-0.5 line-clamp-2">{subtitle}</p>}
          </div>
        </div>

        <div ref={boxRef} className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-6 relative">
          <div className="relative w-full">
            <Search className="absolute left-4 top-3 text-slate-400" size={18} />
            <input
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); openSearch() }}
              onFocus={openSearch}
              onKeyDown={(e) => { if (e.key === 'Enter' && filtered[0]) go(filtered[0].path) }}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="Buscar cursos, tareas o evaluaciones"
            />
            {searchText && <button onClick={() => setSearchText('')} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"><X size={18}/></button>}
          </div>

          {searchOpen && (
            <div className="absolute left-0 right-0 top-14 rounded-3xl bg-white border border-slate-100 shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-black text-slate-800">Busqueda inteligente</p>
                <p className="text-xs text-slate-400 font-bold">{searchLoading ? 'Cargando...' : `${filtered.length} resultado(s)`}</p>
              </div>
              <div className="max-h-96 overflow-auto p-2">
                {searchLoading && <div className="p-4 text-sm font-bold text-slate-500">Buscando coincidencias...</div>}
                {!searchLoading && filtered.length === 0 && <div className="p-4 text-sm font-bold text-slate-500">No se encontraron resultados.</div>}
                {!searchLoading && filtered.map(item => (
                  <button key={item.id} onClick={() => go(item.path)} className="w-full text-left rounded-2xl p-3 hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-blue-700 bg-blue-100 rounded-full px-3 py-1">{item.type}</span>
                      <span className="text-[11px] text-slate-400 font-bold truncate max-w-[140px]">{item.meta}</span>
                    </div>
                    <p className="mt-2 font-black text-slate-900 truncate">{item.title}</p>
                    <p className="text-sm text-slate-500 truncate">{item.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 relative">
          <button onClick={() => setOpen(!open)} className="relative h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-blue-50 transition">
            <Bell size={20} />
            {notifications.length > 0 && <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
          </button>

          {open && (
            <div className="absolute right-0 top-14 w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden z-50">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-slate-900">Notificaciones</h3>
                  <p className="text-xs text-slate-500">Avisos recientes de la plataforma</p>
                </div>
                <CheckCircle2 className="text-blue-600" />
              </div>
              <div className="max-h-96 overflow-auto p-3 space-y-3">
                {notifications.length === 0 && <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-sm text-slate-500 font-bold">No hay notificaciones recientes.</div>}
                {notifications.map(n => (
                  <button key={n.id} onClick={() => { if (n.path) navigate(n.path); setOpen(false) }} className="w-full text-left rounded-2xl bg-slate-50 p-4 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-blue-700 bg-blue-100 rounded-full px-3 py-1">{n.tipo}</span>
                      <span className="text-xs text-slate-400 font-bold">{n.fecha}</span>
                    </div>
                    <p className="mt-3 font-black text-slate-900">{n.titulo}</p>
                    <p className="mt-1 text-sm text-slate-500">{n.mensaje}</p>
                    <p className="mt-2 text-xs font-black text-blue-600">Abrir {n.tab || 'detalle'} →</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-3 py-2 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black">
              {(user.nombres || 'U').charAt(0)}
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 leading-none">{user.nombres || 'Usuario'}</p>
              <p className="text-xs text-slate-400 font-semibold mt-1">{user.rol || 'ROL'}</p>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden px-4 pb-4">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-lg p-3 grid gap-2">
            {mobileMenu.map(([label, path]) => (
              <button key={path} onClick={() => { setMobileOpen(false); navigate(path) }} className="w-full text-left rounded-2xl px-4 py-3 text-sm font-black text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                {label}
              </button>
            ))}
            <button onClick={() => { localStorage.removeItem('sau_user'); localStorage.removeItem('sau_token'); navigate('/login') }} className="w-full text-left rounded-2xl px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50">
              Cerrar sesion
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
