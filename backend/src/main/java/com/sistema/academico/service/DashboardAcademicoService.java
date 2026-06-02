package com.sistema.academico.service;

import com.sistema.academico.entity.*;
import com.sistema.academico.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DashboardAcademicoService {
    private final AcademicAccessService access;
    private final CursoRepository cursoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final MaterialRepository materialRepository;
    private final TareaRepository tareaRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final ClaseZoomRepository claseZoomRepository;
    private final AnuncioRepository anuncioRepository;
    private final MaterialVistoRepository materialVistoRepository;
    private final EntregaTareaRepository entregaTareaRepository;
    private final RespuestaEvaluacionRepository respuestaEvaluacionRepository;

    public DashboardAcademicoService(AcademicAccessService access, CursoRepository cursoRepository,
                                     InscripcionRepository inscripcionRepository, MaterialRepository materialRepository,
                                     TareaRepository tareaRepository, EvaluacionRepository evaluacionRepository,
                                     ClaseZoomRepository claseZoomRepository, AnuncioRepository anuncioRepository,
                                     MaterialVistoRepository materialVistoRepository,
                                     EntregaTareaRepository entregaTareaRepository,
                                     RespuestaEvaluacionRepository respuestaEvaluacionRepository) {
        this.access = access;
        this.cursoRepository = cursoRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.materialRepository = materialRepository;
        this.tareaRepository = tareaRepository;
        this.evaluacionRepository = evaluacionRepository;
        this.claseZoomRepository = claseZoomRepository;
        this.anuncioRepository = anuncioRepository;
        this.materialVistoRepository = materialVistoRepository;
        this.entregaTareaRepository = entregaTareaRepository;
        this.respuestaEvaluacionRepository = respuestaEvaluacionRepository;
    }

    public List<Curso> cursosPublicos() { return cursoRepository.findAll(); }

    public Map<String, Object> estudianteDashboard(String correo) {
        Usuario estudiante = access.currentUser(correo);
        List<Map<String, Object>> cursos = cursosDelEstudianteConProgreso(estudiante);
        List<Curso> cursosBase = access.cursosDelEstudiante(estudiante.id);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("usuario", estudiante);
        map.put("cursos", cursos);
        map.put("tareasPendientes", cursosBase.stream().mapToInt(c -> tareaRepository.findByCursoId(c.id).size()).sum());
        map.put("evaluaciones", cursosBase.stream().mapToInt(c -> evaluacionRepository.findByCursoId(c.id).size()).sum());
        map.put("clasesZoom", cursosBase.stream().mapToInt(c -> claseZoomRepository.findByCursoId(c.id).size()).sum());
        return map;
    }

    public Map<String, Object> detalleCursoEstudiante(String correo, Long cursoId) {
        Usuario estudiante = access.currentUser(correo);
        Curso curso = cursoRepository.findById(cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        access.validarEstudianteMatriculado(estudiante.id, cursoId);
        Map<String, Object> map = detalleBase(curso);
        Map<Long, EntregaTarea> misEntregas = new LinkedHashMap<>();
        for (EntregaTarea entrega : entregaTareaRepository.findByEstudianteId(estudiante.id)) {
            if (entrega.tarea != null && entrega.tarea.curso != null && Objects.equals(entrega.tarea.curso.id, cursoId)) {
                misEntregas.put(entrega.tarea.id, entrega);
            }
        }
        Map<Long, RespuestaEvaluacion> misRespuestas = new LinkedHashMap<>();
        for (RespuestaEvaluacion respuesta : respuestaEvaluacionRepository.findByEstudianteId(estudiante.id)) {
            if (respuesta.evaluacion != null && respuesta.evaluacion.curso != null && Objects.equals(respuesta.evaluacion.curso.id, cursoId)) {
                misRespuestas.put(respuesta.evaluacion.id, respuesta);
            }
        }
        map.put("misEntregas", misEntregas);
        map.put("misRespuestas", misRespuestas);
        Map<Long, Boolean> materialesVistos = new LinkedHashMap<>();
        for (MaterialVisto visto : materialVistoRepository.findByEstudianteId(estudiante.id)) {
            if (visto.material != null && visto.material.curso != null && Objects.equals(visto.material.curso.id, cursoId)) {
                materialesVistos.put(visto.material.id, true);
            }
        }
        map.put("materialesVistos", materialesVistos);
        map.put("progresoMateriales", calcularProgresoMateriales(estudiante.id, cursoId));
        return map;
    }

    public Map<String, Object> detalleCursoDocente(String correo, Long cursoId) {
        Usuario docente = access.currentUser(correo);
        Curso curso = cursoRepository.findById(cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        access.validarCursoDelDocente(docente, curso);
        Map<String, Object> map = detalleBase(curso);
        map.put("estudiantes", access.estudiantesMatriculados(cursoId));
        return map;
    }

    public Map<String, Object> docenteDashboard(String correo) {
        Usuario docente = access.currentUser(correo);
        List<Curso> cursos = cursoRepository.findByDocenteId(docente.id);
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("usuario", docente);
        map.put("cursos", cursos);
        map.put("tareas", cursos.stream().mapToInt(c -> tareaRepository.findByCursoId(c.id).size()).sum());
        map.put("evaluaciones", cursos.stream().mapToInt(c -> evaluacionRepository.findByCursoId(c.id).size()).sum());
        map.put("zoom", cursos.stream().mapToInt(c -> claseZoomRepository.findByCursoId(c.id).size()).sum());
        map.put("horario", cursos.stream().map(this::horarioMap).toList());
        return map;
    }

    public List<Map<String, Object>> notificaciones(String correo) {
        Usuario usuario = access.currentUser(correo);
        List<Curso> cursos = "DOCENTE".equalsIgnoreCase(usuario.rol) ? cursoRepository.findByDocenteId(usuario.id)
                : ("ADMIN".equalsIgnoreCase(usuario.rol) ? cursoRepository.findAll() : access.cursosDelEstudiante(usuario.id));
        List<Map<String, Object>> lista = new ArrayList<>();
        long id = 1;
        String base = "DOCENTE".equalsIgnoreCase(usuario.rol) ? "/docente/curso/" : "/estudiante/curso/";
        for (Curso c : cursos) {
            for (Anuncio a : anuncioRepository.findByCursoId(c.id)) lista.add(notif(id++, "Anuncio", a.titulo, c.nombre + ": " + a.mensaje, a.fecha == null ? "Hoy" : a.fecha.toString(), c.id, a.id, "Anuncios", base + c.id + "?tab=Anuncios"));
            for (Material m : materialRepository.findByCursoId(c.id)) lista.add(notif(id++, "Material", "Material nuevo disponible", c.nombre + ": " + m.titulo, m.semana == null ? "Reciente" : m.semana, c.id, m.id, "Contenido", base + c.id + "?tab=Contenido"));
            for (Tarea t : tareaRepository.findByCursoId(c.id)) lista.add(notif(id++, "Tarea", t.titulo, c.nombre + " vence " + t.fechaLimite, t.estado == null ? "Pendiente" : t.estado, c.id, t.id, "Tareas", base + c.id + "?tab=Tareas"));
            for (Evaluacion e : evaluacionRepository.findByCursoId(c.id)) lista.add(notif(id++, "Evaluacion", e.titulo, c.nombre + " - " + (e.duracionMinutos == null ? 30 : e.duracionMinutos) + " min", e.estado == null ? "Disponible" : e.estado, c.id, e.id, "Evaluaciones", base + c.id + "?tab=Evaluaciones"));
            for (ClaseZoom z : claseZoomRepository.findByCursoId(c.id)) lista.add(notif(id++, "Zoom", z.titulo, c.nombre + " - " + z.fecha + " " + z.hora, "Programado", c.id, z.id, "Zoom", base + c.id + "?tab=Zoom"));
        }
        Collections.reverse(lista);
        return lista.stream().limit(12).toList();
    }

    private List<Map<String, Object>> cursosDelEstudianteConProgreso(Usuario estudiante) {
        List<Map<String, Object>> lista = new ArrayList<>();
        for (Curso c : access.cursosDelEstudiante(estudiante.id)) {
            Map<String, Object> cursoMap = new LinkedHashMap<>();
            cursoMap.put("id", c.id); cursoMap.put("codigo", c.codigo); cursoMap.put("nombre", c.nombre);
            cursoMap.put("descripcion", c.descripcion); cursoMap.put("creditos", c.creditos); cursoMap.put("ciclo", c.ciclo);
            cursoMap.put("modalidad", c.modalidad); cursoMap.put("categoria", c.categoria); cursoMap.put("estado", c.estado);
            cursoMap.put("color", c.color); cursoMap.put("aula", c.aula); cursoMap.put("horario", c.horario); cursoMap.put("docente", c.docente);
            int progreso = calcularProgresoMateriales(estudiante.id, c.id);
            cursoMap.put("avance", progreso); cursoMap.put("progreso", progreso);
            lista.add(cursoMap);
        }
        return lista;
    }

    private int calcularProgresoMateriales(Long estudianteId, Long cursoId) {
        long total = materialRepository.findByCursoId(cursoId).size();
        if (total == 0) return 0;
        long vistos = materialVistoRepository.countByMaterialCursoIdAndEstudianteId(cursoId, estudianteId);
        return Math.round((vistos * 100f) / total);
    }

    private Map<String, Object> detalleBase(Curso curso) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("curso", curso);
        map.put("materiales", materialRepository.findByCursoId(curso.id));
        map.put("tareas", tareaRepository.findByCursoId(curso.id));
        map.put("evaluaciones", evaluacionRepository.findByCursoId(curso.id));
        map.put("zoom", claseZoomRepository.findByCursoId(curso.id));
        map.put("anuncios", anuncioRepository.findByCursoId(curso.id));
        return map;
    }

    private Map<String, Object> horarioMap(Curso c) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("curso", c.nombre); map.put("horario", c.horario); map.put("aula", c.aula); map.put("modalidad", c.modalidad);
        return map;
    }

    private Map<String, Object> notif(Long id, String tipo, String titulo, String mensaje, String fecha, Long cursoId, Long entidadId, String tab, String path) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", id); map.put("tipo", tipo); map.put("titulo", titulo); map.put("mensaje", mensaje); map.put("fecha", fecha);
        map.put("cursoId", cursoId); map.put("entidadId", entidadId); map.put("tab", tab); map.put("path", path);
        return map;
    }
}
