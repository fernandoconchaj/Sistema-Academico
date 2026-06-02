import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, ClipboardList, Edit3, Plus, Save, Trash2, Users, X } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout.jsx'
import { api, normalizeCourses } from '../api/client.js'

const emptyQuestion = { texto: '', correcta: 'Verdadero' }

export default function TeacherEvaluations() {
  const [courses, setCourses] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('Cargando evaluaciones reales...')
  const [form, setForm] = useState(blankForm())
  const [questions, setQuestions] = useState([{ ...emptyQuestion }])
  const [responses, setResponses] = useState(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const dash = await api('/api/docente/dashboard')
    const cs = normalizeCourses(dash.cursos || [])
    setCourses(cs)
    const all = []
    for (const c of cs) {
      const detail = await api(`/api/docente/cursos/${c.id}`)
      ;(detail.evaluaciones || []).forEach(e => all.push({ ...e, curso: c }))
    }
    setEvaluations(all)
    setMessage('Solo se muestran evaluaciones de tus cursos asignados')
  }

  useEffect(() => { load().catch(e => setMessage(e.message)) }, [])

  function openCreate() {
    const first = courses[0]?.id || ''
    setSelected(null)
    setForm({ ...blankForm(), cursoId: first })
    setQuestions(defaultQuestionsForCourse(courses[0]?.nombre || ''))
    setModal('form')
  }

  function openEdit(ev) {
    setSelected(ev)
    setForm({
      titulo: ev.titulo || '',
      descripcion: ev.descripcion || '',
      cursoId: ev.curso?.id || ev.cursoId || '',
      fecha: ev.fecha || '',
      duracionMinutos: ev.duracionMinutos || 30,
      intentos: ev.intentos || 1,
      puntaje: ev.puntaje || 20
    })
    setQuestions(parseQuestions(ev.preguntasJson, ev.curso?.nombre || ''))
    setModal('form')
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        cursoId: Number(form.cursoId),
        duracionMinutos: Number(form.duracionMinutos),
        intentos: Number(form.intentos),
        puntaje: Number(form.puntaje),
        preguntasJson: JSON.stringify(questions.filter(q => q.texto.trim()).map(q => ({
          texto: q.texto.trim(),
          opciones: ['Verdadero', 'Falso'],
          correcta: q.correcta
        })))
      }
      if (selected?.id) {
        await api(`/api/docente/evaluaciones/${selected.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        setMessage('Evaluacion actualizada correctamente')
      } else {
        await api('/api/docente/evaluaciones', { method: 'POST', body: JSON.stringify(payload) })
        setMessage('Evaluacion creada y publicada para estudiantes matriculados')
      }
      setModal(null)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function openResponses(ev) {
    setSelected(ev)
    setModal('respuestas')
    setResponses(null)
    const res = await api(`/api/docente/evaluaciones/${ev.id}/respuestas`)
    setResponses(res || [])
  }

  return <DashboardLayout role="DOCENTE" title="Evaluaciones" subtitle="Crea evaluaciones, revisa respuestas y controla intentos">
    <section className="rounded-3xl bg-white border border-slate-100 p-5 shadow-card mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h3 className="font-black text-slate-900">Evaluaciones de mis cursos</h3>
        <p className="text-sm text-slate-500 mt-1">{message}</p>
      </div>
      <button onClick={openCreate} className="rounded-2xl bg-blue-600 text-white px-5 py-3 font-black hover:bg-blue-700 flex items-center justify-center gap-2"><Plus size={18}/> Crear evaluacion</button>
    </section>

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      {evaluations.map(ev => <div key={ev.id} className="rounded-3xl bg-white border border-slate-100 p-6 shadow-card hover:shadow-soft transition">
        <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-5"><ClipboardList /></div>
        <p className="text-xs font-black text-blue-700 uppercase">{ev.curso?.nombre}</p>
        <h3 className="font-black text-slate-900 mt-2">{ev.titulo}</h3>
        <p className="text-sm text-slate-500 mt-2 flex items-center gap-2"><CalendarDays size={16}/> {ev.fecha} • {ev.duracionMinutos} min • {ev.intentos} intento(s)</p>
        <p className="text-sm text-slate-500 mt-3 line-clamp-2">{ev.descripcion}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={() => openResponses(ev)} className="rounded-2xl bg-slate-900 text-white py-3 font-black hover:bg-blue-700">Ver respuestas</button>
          <button onClick={() => openEdit(ev)} className="rounded-2xl bg-blue-50 text-blue-700 py-3 font-black hover:bg-blue-100 flex items-center justify-center gap-2"><Edit3 size={16}/> Editar</button>
        </div>
      </div>)}
    </div>

    {modal === 'form' && <EvaluationFormModal
      selected={selected}
      form={form}
      setForm={setForm}
      questions={questions}
      setQuestions={setQuestions}
      courses={courses}
      save={save}
      saving={saving}
      close={() => setModal(null)}
    />}

    {modal === 'respuestas' && <ResponsesModal selected={selected} responses={responses} close={() => setModal(null)} />}
  </DashboardLayout>
}

function EvaluationFormModal({ selected, form, setForm, questions, setQuestions, courses, save, saving, close }) {
  const selectedCourse = useMemo(() => courses.find(c => String(c.id) === String(form.cursoId)), [courses, form.cursoId])
  function changeCourse(e) {
    const cursoId = e.target.value
    setForm({ ...form, cursoId })
    const c = courses.find(x => String(x.id) === String(cursoId))
    if (!selected) setQuestions(defaultQuestionsForCourse(c?.nombre || ''))
  }
  function updateQuestion(index, patch) {
    setQuestions(questions.map((q, i) => i === index ? { ...q, ...patch } : q))
  }
  function removeQuestion(index) {
    setQuestions(questions.filter((_, i) => i !== index))
  }
  function addQuestion() {
    setQuestions([...questions, { ...emptyQuestion }])
  }

  return <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
      <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between z-10">
        <div>
          <h2 className="text-xl font-black text-slate-900">{selected ? 'Editar evaluacion' : 'Crear evaluacion'}</h2>
          <p className="text-sm text-slate-500 mt-1">Configura el examen con preguntas propias del curso. Lo que guardes sera lo que vera el estudiante.</p>
        </div>
        <button onClick={close} className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center"><X size={18}/></button>
      </div>

      <form onSubmit={save} className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Titulo de la evaluacion" value={form.titulo} onChange={e=>setForm({...form,titulo:e.target.value})} placeholder="Ej. Practica calificada de integrales" />
          <Select label="Curso" value={form.cursoId} onChange={changeCourse} options={courses}/>
          <Input label="Fecha de cierre" type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/>
          <Input label="Duracion en minutos" type="number" min="1" value={form.duracionMinutos} onChange={e=>setForm({...form,duracionMinutos:e.target.value})}/>
          <Input label="Intentos permitidos" type="number" min="1" value={form.intentos} onChange={e=>setForm({...form,intentos:e.target.value})}/>
          <Input label="Puntaje total" type="number" min="1" value={form.puntaje} onChange={e=>setForm({...form,puntaje:e.target.value})}/>
        </div>

        <label className="block">
          <span className="text-sm font-black text-slate-700">Descripcion / indicaciones</span>
          <textarea required rows="3" value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} placeholder="Ej. Resolver con cuidado. Solo se permite un intento." className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" />
        </label>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h3 className="font-black text-slate-900">Preguntas del examen</h3>
              <p className="text-sm text-slate-500">Curso seleccionado: <b>{selectedCourse?.nombre || 'Selecciona un curso'}</b>. Usa Verdadero/Falso para que el sistema pueda calcular nota automaticamente.</p>
            </div>
            <button type="button" onClick={addQuestion} className="rounded-2xl bg-white border border-slate-200 px-4 py-2 font-black text-blue-700 hover:bg-blue-50 flex items-center gap-2"><Plus size={16}/> Agregar pregunta</button>
          </div>

          <div className="space-y-3">
            {questions.map((q, index) => <div key={index} className="rounded-2xl bg-white border border-slate-200 p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">{index + 1}</div>
                <div className="flex-1 grid md:grid-cols-[1fr_180px_44px] gap-3">
                  <input required value={q.texto} onChange={e=>updateQuestion(index, { texto:e.target.value })} placeholder="Escribe la pregunta" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" />
                  <select value={q.correcta} onChange={e=>updateQuestion(index, { correcta:e.target.value })} className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100">
                    <option>Verdadero</option>
                    <option>Falso</option>
                  </select>
                  <button type="button" disabled={questions.length === 1} onClick={()=>removeQuestion(index)} className="rounded-xl bg-red-50 text-red-600 flex items-center justify-center disabled:opacity-40"><Trash2 size={18}/></button>
                </div>
              </div>
            </div>)}
          </div>
        </div>

        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex items-start gap-3 text-sm text-blue-800">
          <CheckCircle2 size={18} className="mt-0.5" />
          <p><b>Importante:</b> esta evaluacion quedara disponible y solo aparecera a los estudiantes matriculados en este curso. Si editas las preguntas, los nuevos estudiantes veran la version actualizada.</p>
        </div>

        <button disabled={saving} className="w-full rounded-2xl bg-blue-600 text-white py-3.5 font-black hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-60"><Save size={18}/> {saving ? 'Guardando...' : selected ? 'Guardar cambios' : 'Publicar evaluacion'}</button>
      </form>
    </div>
  </div>
}

function ResponsesModal({ selected, responses, close }) {
  return <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-5"><h2 className="text-xl font-black text-slate-900">Respuestas - {selected?.titulo}</h2><button onClick={close} className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center"><X size={18}/></button></div>
      {responses === null ? <p>Cargando...</p> : responses.length === 0 ? <p className="rounded-2xl bg-slate-50 p-5 text-slate-500 font-bold">Todavia no hay respuestas reales de estudiantes matriculados.</p> : <div className="space-y-3">{responses.map(r=><div key={r.id} className="rounded-2xl bg-slate-50 border p-4 flex items-center justify-between"><div className="flex items-center gap-3"><div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center"><Users size={18}/></div><div><p className="font-black text-slate-900">{r.estudiante?.nombres} {r.estudiante?.apellidos}</p><p className="text-xs text-slate-500">{r.estado} • Intento {r.intento}</p></div></div><span className="font-black text-green-700 bg-green-100 rounded-full px-3 py-1">{r.puntaje}/{selected?.puntaje || 20}</span></div>)}</div>}
    </div>
  </div>
}

function blankForm(){ return { titulo:'', descripcion:'', cursoId:'', fecha:'', duracionMinutos:30, intentos:1, puntaje:20 } }
function Input({ label, type='text', ...props }) { return <label className="block"><span className="text-sm font-black text-slate-700">{label}</span><input type={type} required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" {...props}/></label> }
function Select({ label, options, ...props }) { return <label className="block"><span className="text-sm font-black text-slate-700">{label}</span><select required className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" {...props}>{options.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label> }

function parseQuestions(json, courseName) {
  try {
    const arr = JSON.parse(json || '[]')
    if (Array.isArray(arr) && arr.length) return arr.map(q => ({ texto: q.texto || '', correcta: q.correcta || 'Verdadero' }))
  } catch {}
  return defaultQuestionsForCourse(courseName)
}

function defaultQuestionsForCourse(name='') {
  const n = name.toLowerCase()
  if (n.includes('calculo') || n.includes('integral')) return [
    { texto:'La integral definida permite calcular el area bajo una curva.', correcta:'Verdadero' },
    { texto:'La integral de una suma se puede separar como suma de integrales.', correcta:'Verdadero' },
    { texto:'La derivada siempre es igual a la integral.', correcta:'Falso' }
  ]
  if (n.includes('fisica')) return [
    { texto:'La velocidad relaciona desplazamiento y tiempo.', correcta:'Verdadero' },
    { texto:'La aceleracion mide el cambio de velocidad respecto al tiempo.', correcta:'Verdadero' },
    { texto:'En el MRU la aceleracion es constante y distinta de cero.', correcta:'Falso' }
  ]
  if (n.includes('seguridad')) return [
    { texto:'El cifrado ayuda a proteger la confidencialidad de la informacion.', correcta:'Verdadero' },
    { texto:'Una contraseña debil mejora la seguridad del sistema.', correcta:'Falso' },
    { texto:'La autenticacion verifica la identidad del usuario.', correcta:'Verdadero' }
  ]
  return [
    { texto:'Spring Boot se usa principalmente para crear el backend de una aplicacion web.', correcta:'Verdadero' },
    { texto:'JPA permite mapear clases Java con tablas de base de datos.', correcta:'Verdadero' },
    { texto:'React se ejecuta dentro de la base de datos.', correcta:'Falso' }
  ]
}
