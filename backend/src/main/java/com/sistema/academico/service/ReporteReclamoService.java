package com.sistema.academico.service;

import com.sistema.academico.dto.*;
import com.sistema.academico.entity.*;
import com.sistema.academico.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReporteReclamoService {
    private final AcademicAccessService access;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final TareaRepository tareaRepository;
    private final ClaseZoomRepository claseZoomRepository;
    private final ReporteReclamoRepository reporteReclamoRepository;

    public ReporteReclamoService(AcademicAccessService access, UsuarioRepository usuarioRepository, CursoRepository cursoRepository,
                                 InscripcionRepository inscripcionRepository, TareaRepository tareaRepository,
                                 ClaseZoomRepository claseZoomRepository, ReporteReclamoRepository reporteReclamoRepository) {
        this.access = access;
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.tareaRepository = tareaRepository;
        this.claseZoomRepository = claseZoomRepository;
        this.reporteReclamoRepository = reporteReclamoRepository;
    }

    public Map<String, Object> reportes() {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("estudiantes", usuarioRepository.findByRol("ESTUDIANTE"));
        map.put("docentes", usuarioRepository.findByRol("DOCENTE"));
        map.put("cursos", cursoRepository.findAll());
        map.put("inscripciones", inscripcionRepository.findAll());
        map.put("reclamos", reporteReclamoRepository.findAllByOrderByFechaCreacionDesc());
        map.put("totalUsuarios", usuarioRepository.count());
        map.put("totalCursos", cursoRepository.count());
        map.put("totalTareas", tareaRepository.count());
        map.put("totalZoom", claseZoomRepository.count());
        map.put("totalReclamos", reporteReclamoRepository.count());
        map.put("reclamosPendientes", reporteReclamoRepository.countByEstadoIgnoreCase("Pendiente"));
        return map;
    }

    public ReporteReclamo crearReporte(String correo, CreateReporteRequest r) {
        Usuario usuario = access.currentUser(correo);
        Curso curso = null;
        if (r.cursoId != null) {
            curso = cursoRepository.findById(r.cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
            access.validarParticipacionCurso(usuario, curso);
        }
        if (r.asunto == null || r.asunto.trim().isBlank()) throw new RuntimeException("El asunto es obligatorio");
        if (r.descripcion == null || r.descripcion.trim().isBlank()) throw new RuntimeException("La descripcion es obligatoria");
        ReporteReclamo reporte = new ReporteReclamo(usuario, curso,
                r.tipo == null || r.tipo.isBlank() ? "Reclamo academico" : r.tipo,
                r.asunto.trim(), r.descripcion.trim(),
                r.prioridad == null || r.prioridad.isBlank() ? "Media" : r.prioridad);
        reporte.archivoNombre = r.archivoNombre; reporte.archivoTipo = r.archivoTipo; reporte.archivoBase64 = r.archivoBase64;
        return reporteReclamoRepository.save(reporte);
    }

    public List<ReporteReclamo> misReportes(String correo) {
        Usuario usuario = access.currentUser(correo);
        return reporteReclamoRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuario.id);
    }

    public List<ReporteReclamo> reportesReclamosAdmin() {
        return reporteReclamoRepository.findAllByOrderByFechaCreacionDesc();
    }

    public ReporteReclamo responderReporte(Long id, ResponderReporteRequest r) {
        ReporteReclamo reporte = reporteReclamoRepository.findById(id).orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
        reporte.estado = r.estado == null || r.estado.isBlank() ? reporte.estado : r.estado;
        reporte.respuestaAdmin = r.respuestaAdmin == null ? reporte.respuestaAdmin : r.respuestaAdmin;
        reporte.fechaRespuesta = java.time.LocalDateTime.now();
        return reporteReclamoRepository.save(reporte);
    }
}
