package com.sistema.academico.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sistema.academico.dto.*;
import com.sistema.academico.entity.*;
import com.sistema.academico.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class ActividadAcademicaService {
    private final AcademicAccessService access;
    private final FechaService fechaService;
    private final CursoRepository cursoRepository;
    private final MaterialRepository materialRepository;
    private final TareaRepository tareaRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final ClaseZoomRepository claseZoomRepository;
    private final AnuncioRepository anuncioRepository;
    private final EntregaTareaRepository entregaTareaRepository;
    private final RespuestaEvaluacionRepository respuestaEvaluacionRepository;
    private final MaterialVistoRepository materialVistoRepository;

    public ActividadAcademicaService(AcademicAccessService access, FechaService fechaService, CursoRepository cursoRepository,
                                     MaterialRepository materialRepository, TareaRepository tareaRepository,
                                     EvaluacionRepository evaluacionRepository, ClaseZoomRepository claseZoomRepository,
                                     AnuncioRepository anuncioRepository, EntregaTareaRepository entregaTareaRepository,
                                     RespuestaEvaluacionRepository respuestaEvaluacionRepository,
                                     MaterialVistoRepository materialVistoRepository) {
        this.access = access;
        this.fechaService = fechaService;
        this.cursoRepository = cursoRepository;
        this.materialRepository = materialRepository;
        this.tareaRepository = tareaRepository;
        this.evaluacionRepository = evaluacionRepository;
        this.claseZoomRepository = claseZoomRepository;
        this.anuncioRepository = anuncioRepository;
        this.entregaTareaRepository = entregaTareaRepository;
        this.respuestaEvaluacionRepository = respuestaEvaluacionRepository;
        this.materialVistoRepository = materialVistoRepository;
    }

    public Tarea crearTarea(String correo, CreateActividadRequest r) {
        Usuario docente = access.currentUser(correo);
        Curso curso = cursoRepository.findById(r.cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        access.validarCursoDelDocente(docente, curso);
        Tarea tarea = new Tarea(curso, r.titulo, r.descripcion, fechaService.parseDate(r.fechaLimite, LocalDate.now().plusDays(7)), r.puntaje == null ? 20 : r.puntaje, "Por entregar");
        tarea.archivoNombre = r.archivoNombre; tarea.archivoTipo = r.archivoTipo; tarea.archivoBase64 = r.archivoBase64; tarea.urlArchivo = r.url;
        return tareaRepository.save(tarea);
    }

    public Evaluacion crearEvaluacion(String correo, CreateActividadRequest r) {
        Usuario docente = access.currentUser(correo);
        Curso curso = cursoRepository.findById(r.cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        access.validarCursoDelDocente(docente, curso);
        Evaluacion evaluacion = new Evaluacion(curso, r.titulo, r.descripcion, fechaService.parseDate(r.fecha, LocalDate.now().plusDays(10)), r.duracionMinutos == null ? 30 : r.duracionMinutos, r.intentos == null ? 1 : r.intentos, r.puntaje == null ? 20 : r.puntaje, "Disponible");
        evaluacion.preguntasJson = r.preguntasJson == null || r.preguntasJson.isBlank() ? preguntasPorCurso(curso) : r.preguntasJson;
        return evaluacionRepository.save(evaluacion);
    }

    public Evaluacion actualizarEvaluacion(String correo, Long evaluacionId, CreateActividadRequest r) {
        Usuario docente = access.currentUser(correo);
        Evaluacion evaluacion = evaluacionRepository.findById(evaluacionId).orElseThrow(() -> new RuntimeException("Evaluacion no encontrada"));
        Curso curso = cursoRepository.findById(r.cursoId == null ? evaluacion.curso.id : r.cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        access.validarCursoDelDocente(docente, curso);
        access.validarCursoDelDocente(docente, evaluacion.curso);
        evaluacion.curso = curso;
        if (r.titulo != null) evaluacion.titulo = r.titulo;
        if (r.descripcion != null) evaluacion.descripcion = r.descripcion;
        evaluacion.fecha = fechaService.parseDate(r.fecha, evaluacion.fecha == null ? LocalDate.now().plusDays(10) : evaluacion.fecha);
        if (r.duracionMinutos != null) evaluacion.duracionMinutos = r.duracionMinutos;
        if (r.intentos != null) evaluacion.intentos = r.intentos;
        if (r.puntaje != null) evaluacion.puntaje = r.puntaje;
        evaluacion.preguntasJson = r.preguntasJson == null || r.preguntasJson.isBlank() ? preguntasPorCurso(curso) : r.preguntasJson;
        return evaluacionRepository.save(evaluacion);
    }

    public ClaseZoom crearZoom(String correo, CreateActividadRequest r) {
        Usuario docente = access.currentUser(correo);
        Curso curso = cursoRepository.findById(r.cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        access.validarCursoDelDocente(docente, curso);
        ClaseZoom zoom = new ClaseZoom(curso, r.titulo, fechaService.parseDate(r.fecha, LocalDate.now().plusDays(1)), r.hora == null ? "19:00" : r.hora, r.enlace, r.grabacion, "SAU-" + System.currentTimeMillis());
        return claseZoomRepository.save(zoom);
    }

    public Material crearMaterial(String correo, CreateActividadRequest r) {
        Usuario docente = access.currentUser(correo);
        Curso curso = cursoRepository.findById(r.cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        access.validarCursoDelDocente(docente, curso);
        return materialRepository.save(buildMaterial(curso, new Material(), r));
    }

    public Material actualizarMaterial(String correo, Long materialId, CreateActividadRequest r) {
        Usuario docente = access.currentUser(correo);
        Material material = materialRepository.findById(materialId).orElseThrow(() -> new RuntimeException("Material no encontrado"));
        access.validarCursoDelDocente(docente, material.curso);
        return materialRepository.save(buildMaterial(material.curso, material, r));
    }

    public void eliminarMaterial(String correo, Long materialId) {
        Usuario docente = access.currentUser(correo);
        Material material = materialRepository.findById(materialId).orElseThrow(() -> new RuntimeException("Material no encontrado"));
        access.validarCursoDelDocente(docente, material.curso);
        materialRepository.delete(material);
    }

    public Anuncio crearAnuncio(CreateActividadRequest r, String correo) {
        Usuario docente = access.currentUser(correo);
        Curso curso = cursoRepository.findById(r.cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        access.validarCursoDelDocente(docente, curso);
        return anuncioRepository.save(new Anuncio(curso, r.titulo, r.mensaje, LocalDate.now(), docente));
    }

    public MaterialVisto marcarMaterialVisto(String correo, Long materialId) {
        Usuario estudiante = access.currentUser(correo);
        Material material = materialRepository.findById(materialId).orElseThrow(() -> new RuntimeException("Material no encontrado"));
        access.validarEstudianteMatriculado(estudiante.id, material.curso.id);
        MaterialVisto visto = materialVistoRepository.findByMaterialIdAndEstudianteId(materialId, estudiante.id).orElse(new MaterialVisto());
        visto.material = material; visto.estudiante = estudiante; visto.fechaVisto = java.time.LocalDateTime.now();
        return materialVistoRepository.save(visto);
    }

    public EntregaTarea entregarTarea(String correo, Long tareaId, EntregaTareaRequest r) {
        Usuario estudiante = access.currentUser(correo);
        Tarea tarea = tareaRepository.findById(tareaId).orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
        access.validarEstudianteMatriculado(estudiante.id, tarea.curso.id);
        EntregaTarea entrega = entregaTareaRepository.findByTareaIdAndEstudianteId(tareaId, estudiante.id).orElse(new EntregaTarea());
        entrega.tarea = tarea; entrega.estudiante = estudiante; entrega.comentario = r.comentario;
        entrega.archivoNombre = r.archivoNombre == null || r.archivoNombre.isBlank() ? "entrega.pdf" : r.archivoNombre;
        entrega.archivoTipo = r.archivoTipo; entrega.archivoBase64 = r.archivoBase64;
        entrega.fechaEntrega = java.time.LocalDateTime.now(); entrega.estado = "Enviado";
        return entregaTareaRepository.save(entrega);
    }

    public List<EntregaTarea> entregasDeTarea(String correo, Long tareaId) {
        Usuario docente = access.currentUser(correo);
        Tarea tarea = tareaRepository.findById(tareaId).orElseThrow(() -> new RuntimeException("Tarea no encontrada"));
        access.validarCursoDelDocente(docente, tarea.curso);
        return entregaTareaRepository.findByTareaId(tareaId);
    }

    public EntregaTarea calificarEntrega(String correo, Long entregaId, CalificarRequest r) {
        Usuario docente = access.currentUser(correo);
        EntregaTarea entrega = entregaTareaRepository.findById(entregaId).orElseThrow(() -> new RuntimeException("Entrega no encontrada"));
        access.validarCursoDelDocente(docente, entrega.tarea.curso);
        entrega.nota = r.nota; entrega.comentarioDocente = r.comentarioDocente; entrega.estado = "Calificado";
        return entregaTareaRepository.save(entrega);
    }

    public RespuestaEvaluacion resolverEvaluacion(String correo, Long evaluacionId, Map<String, Object> respuestas) {
        Usuario estudiante = access.currentUser(correo);
        Evaluacion evaluacion = evaluacionRepository.findById(evaluacionId).orElseThrow(() -> new RuntimeException("Evaluacion no encontrada"));
        access.validarEstudianteMatriculado(estudiante.id, evaluacion.curso.id);
        RespuestaEvaluacion respuesta = respuestaEvaluacionRepository.findByEvaluacionIdAndEstudianteId(evaluacionId, estudiante.id).orElse(null);
        int intentosBase = evaluacion.intentos == null ? 1 : evaluacion.intentos;
        int intentosExtra = respuesta == null || respuesta.intentosAutorizados == null ? 0 : respuesta.intentosAutorizados;
        int intentosUsados = respuesta == null || respuesta.intento == null ? 0 : respuesta.intento;
        if (intentosUsados >= intentosBase + intentosExtra) throw new RuntimeException("Ya finalizaste esta evaluacion. Solo podras realizarla nuevamente si el docente autoriza otro intento.");
        String preguntasJson = evaluacion.preguntasJson == null || evaluacion.preguntasJson.isBlank() ? preguntasPorCurso(evaluacion.curso) : evaluacion.preguntasJson;
        if (respuesta == null) respuesta = new RespuestaEvaluacion();
        respuesta.evaluacion = evaluacion; respuesta.estudiante = estudiante; respuesta.respuestasJson = respuestas == null ? "{}" : respuestas.toString();
        respuesta.fechaEnvio = java.time.LocalDateTime.now(); respuesta.estado = "Finalizado";
        respuesta.puntaje = calcularPuntaje(respuestas, preguntasJson, evaluacion.puntaje == null ? 20 : evaluacion.puntaje);
        respuesta.intento = intentosUsados + 1;
        if (respuesta.intentosAutorizados == null) respuesta.intentosAutorizados = 0;
        respuesta.tiempoUsadoSegundos = extraerEntero(respuestas, "tiempoUsadoSegundos", null);
        respuesta.fechaInicio = java.time.LocalDateTime.now().minusSeconds(respuesta.tiempoUsadoSegundos == null ? 0 : respuesta.tiempoUsadoSegundos);
        respuesta.fechaCierre = java.time.LocalDateTime.now();
        return respuestaEvaluacionRepository.save(respuesta);
    }

    public List<RespuestaEvaluacion> respuestasDeEvaluacion(String correo, Long evaluacionId) {
        Usuario docente = access.currentUser(correo);
        Evaluacion evaluacion = evaluacionRepository.findById(evaluacionId).orElseThrow(() -> new RuntimeException("Evaluacion no encontrada"));
        access.validarCursoDelDocente(docente, evaluacion.curso);
        return respuestaEvaluacionRepository.findByEvaluacionId(evaluacionId);
    }

    public RespuestaEvaluacion calificarRespuesta(String correo, Long respuestaId, CalificarRequest r) {
        Usuario docente = access.currentUser(correo);
        RespuestaEvaluacion respuesta = respuestaEvaluacionRepository.findById(respuestaId).orElseThrow(() -> new RuntimeException("Respuesta no encontrada"));
        access.validarCursoDelDocente(docente, respuesta.evaluacion.curso);
        respuesta.puntaje = r.nota; respuesta.comentarioDocente = r.comentarioDocente; respuesta.estado = "Calificado";
        return respuestaEvaluacionRepository.save(respuesta);
    }

    public RespuestaEvaluacion autorizarNuevoIntento(String correo, Long respuestaId) {
        Usuario docente = access.currentUser(correo);
        RespuestaEvaluacion respuesta = respuestaEvaluacionRepository.findById(respuestaId).orElseThrow(() -> new RuntimeException("Respuesta no encontrada"));
        access.validarCursoDelDocente(docente, respuesta.evaluacion.curso);
        respuesta.intentosAutorizados = (respuesta.intentosAutorizados == null ? 0 : respuesta.intentosAutorizados) + 1;
        respuesta.estado = "Autorizado nuevo intento";
        return respuestaEvaluacionRepository.save(respuesta);
    }

    private Material buildMaterial(Curso curso, Material material, CreateActividadRequest r) {
        material.curso = curso;
        material.semana = r.semana == null || r.semana.isBlank() ? "Semana nueva" : r.semana;
        material.titulo = r.titulo == null || r.titulo.isBlank() ? "Material academico" : r.titulo;
        material.tipo = r.tipo == null || r.tipo.isBlank() ? "PDF" : r.tipo;
        material.url = r.url; material.estado = "Revisado";
        material.contenido = r.contenido == null || r.contenido.isBlank() ? r.descripcion : r.contenido;
        material.archivoNombre = r.archivoNombre == null || r.archivoNombre.isBlank() ? material.titulo.replaceAll("[^a-zA-Z0-9]", "_").toLowerCase() + ".pdf" : r.archivoNombre;
        material.archivoTipo = r.archivoTipo;
        if (r.archivoBase64 != null && !r.archivoBase64.isBlank()) material.archivoBase64 = r.archivoBase64;
        return material;
    }

    private Integer calcularPuntaje(Map<String, Object> respuestas, String preguntasJson, Integer max) {
        if (respuestas == null) return 0;
        try {
            Object answersObj = respuestas.get("answers");
            if (!(answersObj instanceof Map<?, ?> answers)) return 0;
            List<?> preguntas = new ObjectMapper().readValue(preguntasJson == null || preguntasJson.isBlank() ? "[]" : preguntasJson, List.class);
            if (preguntas.isEmpty()) return 0;
            int aciertos = 0;
            for (int i = 0; i < preguntas.size(); i++) {
                Object qObj = preguntas.get(i);
                if (!(qObj instanceof Map<?, ?> q)) continue;
                Object correctaObj = q.get("correcta");
                Object respuestaObj = answers.get(String.valueOf(i));
                if (respuestaObj == null) respuestaObj = answers.get(i);
                if (correctaObj != null && respuestaObj != null && correctaObj.toString().equalsIgnoreCase(respuestaObj.toString())) aciertos++;
            }
            return Math.round((max * aciertos) / (float) preguntas.size());
        } catch (Exception e) { return 0; }
    }

    private String preguntasPorCurso(Curso curso) {
        String nombre = curso.nombre == null ? "" : curso.nombre.toLowerCase();
        if (nombre.contains("calculo") || nombre.contains("integral")) return "[" +
                "{\"texto\":\"La integral definida permite calcular areas bajo una curva en un intervalo.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"}," +
                "{\"texto\":\"La regla de sustitucion se usa para simplificar integrales mediante un cambio de variable.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"}," +
                "{\"texto\":\"La derivada de una funcion siempre es igual a su integral indefinida.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Falso\"}]";
        if (nombre.contains("fisica")) return "[" +
                "{\"texto\":\"La aceleracion representa el cambio de velocidad respecto al tiempo.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"}," +
                "{\"texto\":\"La fuerza neta se relaciona con masa y aceleracion segun la segunda ley de Newton.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"}," +
                "{\"texto\":\"Un cuerpo sin fuerza neta necesariamente esta acelerando.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Falso\"}]";
        if (nombre.contains("seguridad")) return "[" +
                "{\"texto\":\"La confidencialidad busca evitar accesos no autorizados a la informacion.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"}," +
                "{\"texto\":\"Una contrasena segura debe ser corta y facil de adivinar.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Falso\"}," +
                "{\"texto\":\"El cifrado ayuda a proteger datos durante su almacenamiento o transmision.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"}]";
        return "[" +
                "{\"texto\":\"Spring Boot se usa principalmente para crear el backend de una aplicacion web.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"}," +
                "{\"texto\":\"JPA permite mapear clases Java con tablas de base de datos.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"}," +
                "{\"texto\":\"React se ejecuta dentro de PostgreSQL.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Falso\"}]";
    }

    private Integer extraerEntero(Map<String, Object> map, String key, Integer fallback) {
        try {
            if (map == null || !map.containsKey(key) || map.get(key) == null) return fallback;
            Object value = map.get(key);
            if (value instanceof Number n) return n.intValue();
            return Integer.parseInt(value.toString());
        } catch (Exception e) { return fallback; }
    }
}
