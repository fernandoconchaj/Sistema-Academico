package com.sistema.academico.service;

import com.sistema.academico.dto.*;
import com.sistema.academico.entity.*;
import com.sistema.academico.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class AdministracionAcademicaService {
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final TareaRepository tareaRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final ClaseZoomRepository claseZoomRepository;
    private final ReporteReclamoRepository reporteReclamoRepository;
    private final EntregaTareaRepository entregaTareaRepository;
    private final RespuestaEvaluacionRepository respuestaEvaluacionRepository;
    private final MaterialVistoRepository materialVistoRepository;
    private final MaterialRepository materialRepository;
    private final MensajeChatRepository mensajeChatRepository;
    private final AnuncioRepository anuncioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdministracionAcademicaService(UsuarioRepository usuarioRepository, CursoRepository cursoRepository,
                                           InscripcionRepository inscripcionRepository, TareaRepository tareaRepository,
                                           EvaluacionRepository evaluacionRepository, ClaseZoomRepository claseZoomRepository,
                                           ReporteReclamoRepository reporteReclamoRepository,
                                           EntregaTareaRepository entregaTareaRepository,
                                           RespuestaEvaluacionRepository respuestaEvaluacionRepository,
                                           MaterialVistoRepository materialVistoRepository,
                                           MaterialRepository materialRepository,
                                           MensajeChatRepository mensajeChatRepository,
                                           AnuncioRepository anuncioRepository,
                                           PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.tareaRepository = tareaRepository;
        this.evaluacionRepository = evaluacionRepository;
        this.claseZoomRepository = claseZoomRepository;
        this.reporteReclamoRepository = reporteReclamoRepository;
        this.entregaTareaRepository = entregaTareaRepository;
        this.respuestaEvaluacionRepository = respuestaEvaluacionRepository;
        this.materialVistoRepository = materialVistoRepository;
        this.materialRepository = materialRepository;
        this.mensajeChatRepository = mensajeChatRepository;
        this.anuncioRepository = anuncioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, Object> adminDashboard() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("usuarios", usuarioRepository.findAll());
        map.put("cursos", cursoRepository.findAll());
        map.put("inscripciones", inscripcionRepository.findAll());
        map.put("totalUsuarios", usuarioRepository.count());
        map.put("totalCursos", cursoRepository.count());
        map.put("totalInscripciones", inscripcionRepository.count());
        map.put("totalActividades", tareaRepository.count() + evaluacionRepository.count() + claseZoomRepository.count());
        map.put("totalReportes", reporteReclamoRepository.count());
        map.put("reportesPendientes", reporteReclamoRepository.countByEstadoIgnoreCase("Pendiente"));
        return map;
    }

    public Usuario crearUsuario(RegisterRequest r) {
        if (usuarioRepository.findByCorreo(r.correo).isPresent()) throw new RuntimeException("Correo ya registrado");
        Usuario u = new Usuario(r.nombres, r.apellidos, r.correo, passwordEncoder.encode(r.password), r.rol.toUpperCase(), "Activo", r.rol.toUpperCase().substring(0,3) + System.currentTimeMillis(), r.especialidad);
        return usuarioRepository.save(u);
    }

    public Usuario actualizarUsuario(Long id, RegisterRequest r) {
        Usuario u = usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if (r.correo != null && !r.correo.isBlank() && !r.correo.equalsIgnoreCase(u.correo)) {
            if (usuarioRepository.findByCorreo(r.correo).isPresent()) throw new RuntimeException("Correo ya registrado por otro usuario");
            u.correo = r.correo;
        }
        if (r.nombres != null) u.nombres = r.nombres;
        if (r.apellidos != null) u.apellidos = r.apellidos;
        if (r.rol != null && !r.rol.isBlank()) u.rol = r.rol.toUpperCase();
        if (r.especialidad != null) u.especialidad = r.especialidad;
        if (r.password != null && !r.password.isBlank()) u.password = passwordEncoder.encode(r.password);
        return usuarioRepository.save(u);
    }

    public void eliminarUsuario(Long id) {
        Usuario u = usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        if ("ADMIN".equalsIgnoreCase(u.rol) && usuarioRepository.findAll().stream().filter(x -> "ADMIN".equalsIgnoreCase(x.rol)).count() <= 1) {
            throw new RuntimeException("No puedes eliminar el ultimo administrador del sistema");
        }
        if ("DOCENTE".equalsIgnoreCase(u.rol) && !cursoRepository.findByDocenteId(id).isEmpty()) {
            throw new RuntimeException("No puedes eliminar un docente con cursos asignados. Primero cambia el docente de esos cursos.");
        }
        eliminarDependenciasUsuario(id);
        usuarioRepository.delete(u);
    }

    public Curso crearCurso(CreateCursoRequest r) {
        Usuario docente = usuarioRepository.findById(r.docenteId).orElseThrow(() -> new RuntimeException("Docente no encontrado"));
        Curso c = new Curso(r.codigo, r.nombre, r.descripcion, r.creditos == null ? 4 : r.creditos,
                r.ciclo == null || r.ciclo.isBlank() ? "2026-1" : r.ciclo, r.modalidad, r.categoria,
                r.estado == null ? "Activo" : r.estado, r.avance == null ? 0 : r.avance,
                r.color == null || r.color.isBlank() ? "blue" : r.color, r.aula, r.horario, docente);
        Curso guardado = cursoRepository.save(c);
        sincronizarMatriculas(guardado.id, r.estudianteIds);
        return guardado;
    }

    public Curso actualizarCurso(Long cursoId, CreateCursoRequest r) {
        Curso c = cursoRepository.findById(cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        if (r.docenteId != null) c.docente = usuarioRepository.findById(r.docenteId).orElseThrow(() -> new RuntimeException("Docente no encontrado"));
        if (r.codigo != null) c.codigo = r.codigo;
        if (r.nombre != null) c.nombre = r.nombre;
        if (r.descripcion != null) c.descripcion = r.descripcion;
        if (r.creditos != null) c.creditos = r.creditos;
        if (r.ciclo != null) c.ciclo = r.ciclo;
        if (r.modalidad != null) c.modalidad = r.modalidad;
        if (r.categoria != null) c.categoria = r.categoria;
        if (r.estado != null) c.estado = r.estado;
        if (r.color != null) c.color = r.color;
        if (r.aula != null) c.aula = r.aula;
        if (r.horario != null) c.horario = r.horario;
        Curso guardado = cursoRepository.save(c);
        if (r.estudianteIds != null) sincronizarMatriculas(guardado.id, r.estudianteIds);
        return guardado;
    }

    public void eliminarCurso(Long cursoId) {
        Curso curso = cursoRepository.findById(cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        eliminarDependenciasCurso(cursoId);
        cursoRepository.delete(curso);
    }

    public Inscripcion matricular(Long estudianteId, Long cursoId) { return matricularSiNoExiste(estudianteId, cursoId); }

    public void quitarMatricula(Long inscripcionId) {
        Inscripcion inscripcion = inscripcionRepository.findById(inscripcionId).orElseThrow(() -> new RuntimeException("Inscripcion no encontrada"));
        inscripcionRepository.delete(inscripcion);
    }

    public Usuario cambiarEstadoUsuario(Long id) {
        Usuario u = usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        u.estado = "Activo".equalsIgnoreCase(u.estado) ? "Inactivo" : "Activo";
        return usuarioRepository.save(u);
    }

    private void eliminarDependenciasUsuario(Long usuarioId) {
        mensajeChatRepository.deleteAll(mensajeChatRepository.mensajesDelUsuario(usuarioId));
        reporteReclamoRepository.deleteAll(reporteReclamoRepository.findByUsuarioId(usuarioId));
        respuestaEvaluacionRepository.deleteAll(respuestaEvaluacionRepository.findByEstudianteId(usuarioId));
        entregaTareaRepository.deleteAll(entregaTareaRepository.findByEstudianteId(usuarioId));
        materialVistoRepository.deleteAll(materialVistoRepository.findByEstudianteId(usuarioId));
        inscripcionRepository.deleteAll(inscripcionRepository.findByEstudianteId(usuarioId));
        anuncioRepository.deleteAll(anuncioRepository.findByDocenteId(usuarioId));
    }

    private void eliminarDependenciasCurso(Long cursoId) {
        for (Tarea tarea : new ArrayList<>(tareaRepository.findByCursoId(cursoId))) {
            entregaTareaRepository.deleteAll(entregaTareaRepository.findByTareaId(tarea.id));
            tareaRepository.delete(tarea);
        }
        for (Evaluacion evaluacion : new ArrayList<>(evaluacionRepository.findByCursoId(cursoId))) {
            respuestaEvaluacionRepository.deleteAll(respuestaEvaluacionRepository.findByEvaluacionId(evaluacion.id));
            evaluacionRepository.delete(evaluacion);
        }
        for (Material material : new ArrayList<>(materialRepository.findByCursoId(cursoId))) {
            materialVistoRepository.deleteAll(materialVistoRepository.findByMaterialId(material.id));
            materialRepository.delete(material);
        }
        mensajeChatRepository.deleteAll(mensajeChatRepository.findByCursoId(cursoId));
        reporteReclamoRepository.deleteAll(reporteReclamoRepository.findByCursoId(cursoId));
        anuncioRepository.deleteAll(anuncioRepository.findByCursoId(cursoId));
        claseZoomRepository.deleteAll(claseZoomRepository.findByCursoId(cursoId));
        inscripcionRepository.deleteAll(inscripcionRepository.findByCursoId(cursoId));
    }

    private void sincronizarMatriculas(Long cursoId, List<Long> estudianteIds) {
        if (estudianteIds == null) return;
        Set<Long> seleccionados = new LinkedHashSet<>(estudianteIds);
        for (Inscripcion i : new ArrayList<>(inscripcionRepository.findByCursoId(cursoId))) {
            if (i.estudiante != null && !seleccionados.contains(i.estudiante.id)) inscripcionRepository.delete(i);
        }
        for (Long estudianteId : seleccionados) matricularSiNoExiste(estudianteId, cursoId);
    }

    private Inscripcion matricularSiNoExiste(Long estudianteId, Long cursoId) {
        Usuario estudiante = usuarioRepository.findById(estudianteId).orElseThrow(() -> new RuntimeException("Estudiante no encontrado"));
        Curso curso = cursoRepository.findById(cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        Optional<Inscripcion> existente = inscripcionRepository.findByEstudianteId(estudianteId)
                .stream().filter(i -> i.curso != null && Objects.equals(i.curso.id, cursoId)).findFirst();
        return existente.orElseGet(() -> inscripcionRepository.save(new Inscripcion(estudiante, curso, LocalDate.now(), "Matriculado")));
    }
}
