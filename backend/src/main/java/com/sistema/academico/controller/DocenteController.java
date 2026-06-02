package com.sistema.academico.controller;

import com.sistema.academico.dto.*;
import com.sistema.academico.entity.*;
import com.sistema.academico.service.UniversidadService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/docente")
public class DocenteController {
    private final UniversidadService service;

    public DocenteController(UniversidadService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(Authentication authentication) {
        return service.docenteDashboard(authentication.getName());
    }

    @GetMapping("/cursos/{id}")
    public Map<String, Object> detalleCurso(@PathVariable Long id, Authentication authentication) {
        return service.detalleCursoDocente(authentication.getName(), id);
    }

    @PostMapping("/tareas")
    public Tarea crearTarea(@RequestBody CreateActividadRequest request, Authentication authentication) {
        return service.crearTarea(authentication.getName(), request);
    }

    @GetMapping("/tareas/{id}/entregas")
    public List<EntregaTarea> entregas(@PathVariable Long id, Authentication authentication) {
        return service.entregasDeTarea(authentication.getName(), id);
    }

    @PutMapping("/entregas/{id}/calificar")
    public EntregaTarea calificarEntrega(@PathVariable Long id, @RequestBody CalificarRequest request, Authentication authentication) {
        return service.calificarEntrega(authentication.getName(), id, request);
    }

    @PostMapping("/evaluaciones")
    public Evaluacion crearEvaluacion(@RequestBody CreateActividadRequest request, Authentication authentication) {
        return service.crearEvaluacion(authentication.getName(), request);
    }

    @PutMapping("/evaluaciones/{id}")
    public Evaluacion actualizarEvaluacion(@PathVariable Long id, @RequestBody CreateActividadRequest request, Authentication authentication) {
        return service.actualizarEvaluacion(authentication.getName(), id, request);
    }

    @GetMapping("/evaluaciones/{id}/respuestas")
    public List<RespuestaEvaluacion> respuestas(@PathVariable Long id, Authentication authentication) {
        return service.respuestasDeEvaluacion(authentication.getName(), id);
    }

    @PutMapping("/respuestas/{id}/calificar")
    public RespuestaEvaluacion calificarRespuesta(@PathVariable Long id, @RequestBody CalificarRequest request, Authentication authentication) {
        return service.calificarRespuesta(authentication.getName(), id, request);
    }

    @PutMapping("/respuestas/{id}/autorizar")
    public RespuestaEvaluacion autorizarNuevoIntento(@PathVariable Long id, Authentication authentication) {
        return service.autorizarNuevoIntento(authentication.getName(), id);
    }

    @PostMapping("/zoom")
    public ClaseZoom crearZoom(@RequestBody CreateActividadRequest request, Authentication authentication) {
        return service.crearZoom(authentication.getName(), request);
    }

    @PostMapping("/materiales")
    public Material crearMaterial(@RequestBody CreateActividadRequest request, Authentication authentication) {
        return service.crearMaterial(authentication.getName(), request);
    }

    @PutMapping("/materiales/{id}")
    public Material actualizarMaterial(@PathVariable Long id, @RequestBody CreateActividadRequest request, Authentication authentication) {
        return service.actualizarMaterial(authentication.getName(), id, request);
    }

    @DeleteMapping("/materiales/{id}")
    public Map<String, String> eliminarMaterial(@PathVariable Long id, Authentication authentication) {
        service.eliminarMaterial(authentication.getName(), id);
        return Map.of("estado", "Material eliminado");
    }

    @PostMapping("/anuncios")
    public Anuncio crearAnuncio(@RequestBody CreateActividadRequest request, Authentication authentication) {
        return service.crearAnuncio(request, authentication.getName());
    }

    @GetMapping("/notificaciones")
    public List<Map<String, Object>> notificaciones(Authentication authentication) {
        return service.notificaciones(authentication.getName());
    }

    @GetMapping("/reportes")
    public List<ReporteReclamo> misReportes(Authentication authentication) {
        return service.misReportes(authentication.getName());
    }

    @PostMapping("/reportes")
    public ReporteReclamo crearReporte(@RequestBody CreateReporteRequest request, Authentication authentication) {
        return service.crearReporte(authentication.getName(), request);
    }
}
