package com.sistema.academico.service;

import com.sistema.academico.dto.*;
import com.sistema.academico.entity.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UniversidadService {
    private final AcademicAccessService accessService;
    private final DashboardAcademicoService dashboardService;
    private final ActividadAcademicaService actividadService;
    private final AdministracionAcademicaService administracionService;
    private final ChatAcademicoService chatService;
    private final ReporteReclamoService reporteService;

    public UniversidadService(AcademicAccessService accessService,
                              DashboardAcademicoService dashboardService,
                              ActividadAcademicaService actividadService,
                              AdministracionAcademicaService administracionService,
                              ChatAcademicoService chatService,
                              ReporteReclamoService reporteService) {
        this.accessService = accessService;
        this.dashboardService = dashboardService;
        this.actividadService = actividadService;
        this.administracionService = administracionService;
        this.chatService = chatService;
        this.reporteService = reporteService;
    }

    public Usuario currentUser(String correo) { return accessService.currentUser(correo); }
    public List<Curso> cursosPublicos() { return dashboardService.cursosPublicos(); }

    public Map<String, Object> estudianteDashboard(String correo) { return dashboardService.estudianteDashboard(correo); }
    public Map<String, Object> detalleCursoEstudiante(String correo, Long cursoId) { return dashboardService.detalleCursoEstudiante(correo, cursoId); }
    public Map<String, Object> docenteDashboard(String correo) { return dashboardService.docenteDashboard(correo); }
    public Map<String, Object> detalleCursoDocente(String correo, Long cursoId) { return dashboardService.detalleCursoDocente(correo, cursoId); }
    public List<Map<String, Object>> notificaciones(String correo) { return dashboardService.notificaciones(correo); }

    public Tarea crearTarea(String correo, CreateActividadRequest r) { return actividadService.crearTarea(correo, r); }
    public Evaluacion crearEvaluacion(String correo, CreateActividadRequest r) { return actividadService.crearEvaluacion(correo, r); }
    public Evaluacion actualizarEvaluacion(String correo, Long evaluacionId, CreateActividadRequest r) { return actividadService.actualizarEvaluacion(correo, evaluacionId, r); }
    public ClaseZoom crearZoom(String correo, CreateActividadRequest r) { return actividadService.crearZoom(correo, r); }
    public Material crearMaterial(String correo, CreateActividadRequest r) { return actividadService.crearMaterial(correo, r); }
    public Material actualizarMaterial(String correo, Long materialId, CreateActividadRequest r) { return actividadService.actualizarMaterial(correo, materialId, r); }
    public void eliminarMaterial(String correo, Long materialId) { actividadService.eliminarMaterial(correo, materialId); }
    public Anuncio crearAnuncio(CreateActividadRequest r, String correo) { return actividadService.crearAnuncio(r, correo); }
    public MaterialVisto marcarMaterialVisto(String correo, Long materialId) { return actividadService.marcarMaterialVisto(correo, materialId); }
    public EntregaTarea entregarTarea(String correo, Long tareaId, EntregaTareaRequest r) { return actividadService.entregarTarea(correo, tareaId, r); }
    public List<EntregaTarea> entregasDeTarea(String correo, Long tareaId) { return actividadService.entregasDeTarea(correo, tareaId); }
    public EntregaTarea calificarEntrega(String correo, Long entregaId, CalificarRequest r) { return actividadService.calificarEntrega(correo, entregaId, r); }
    public RespuestaEvaluacion resolverEvaluacion(String correo, Long evaluacionId, Map<String, Object> respuestas) { return actividadService.resolverEvaluacion(correo, evaluacionId, respuestas); }
    public List<RespuestaEvaluacion> respuestasDeEvaluacion(String correo, Long evaluacionId) { return actividadService.respuestasDeEvaluacion(correo, evaluacionId); }
    public RespuestaEvaluacion calificarRespuesta(String correo, Long respuestaId, CalificarRequest r) { return actividadService.calificarRespuesta(correo, respuestaId, r); }
    public RespuestaEvaluacion autorizarNuevoIntento(String correo, Long respuestaId) { return actividadService.autorizarNuevoIntento(correo, respuestaId); }

    public Map<String, Object> adminDashboard() { return administracionService.adminDashboard(); }
    public Usuario crearUsuario(RegisterRequest r) { return administracionService.crearUsuario(r); }
    public Usuario actualizarUsuario(Long id, RegisterRequest r) { return administracionService.actualizarUsuario(id, r); }
    public void eliminarUsuario(Long id) { administracionService.eliminarUsuario(id); }
    public Curso crearCurso(CreateCursoRequest r) { return administracionService.crearCurso(r); }
    public Curso actualizarCurso(Long cursoId, CreateCursoRequest r) { return administracionService.actualizarCurso(cursoId, r); }
    public void eliminarCurso(Long cursoId) { administracionService.eliminarCurso(cursoId); }
    public Inscripcion matricular(Long estudianteId, Long cursoId) { return administracionService.matricular(estudianteId, cursoId); }
    public void quitarMatricula(Long inscripcionId) { administracionService.quitarMatricula(inscripcionId); }
    public Usuario cambiarEstadoUsuario(Long id) { return administracionService.cambiarEstadoUsuario(id); }

    public List<Curso> chatCursos(String correo) { return chatService.chatCursos(correo); }
    public List<Map<String, Object>> chatContactos(String correo, Long cursoId, String q) { return chatService.chatContactos(correo, cursoId, q); }
    public List<Map<String, Object>> chatConversaciones(String correo) { return chatService.chatConversaciones(correo); }
    public List<Map<String, Object>> chatMensajes(String correo, Long cursoId, Long usuarioId) { return chatService.chatMensajes(correo, cursoId, usuarioId); }
    public Map<String, Object> enviarMensaje(String correo, CreateMensajeRequest r) { return chatService.enviarMensaje(correo, r); }

    public Map<String, Object> reportes() { return reporteService.reportes(); }
    public ReporteReclamo crearReporte(String correo, CreateReporteRequest r) { return reporteService.crearReporte(correo, r); }
    public List<ReporteReclamo> misReportes(String correo) { return reporteService.misReportes(correo); }
    public List<ReporteReclamo> reportesReclamosAdmin() { return reporteService.reportesReclamosAdmin(); }
    public ReporteReclamo responderReporte(Long id, ResponderReporteRequest r) { return reporteService.responderReporte(id, r); }
}
