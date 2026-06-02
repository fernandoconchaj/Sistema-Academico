package com.sistema.academico.controller;

import com.sistema.academico.dto.EntregaTareaRequest;
import com.sistema.academico.dto.CreateReporteRequest;
import com.sistema.academico.entity.EntregaTarea;
import com.sistema.academico.entity.RespuestaEvaluacion;
import com.sistema.academico.entity.MaterialVisto;
import com.sistema.academico.entity.ReporteReclamo;
import com.sistema.academico.service.UniversidadService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/estudiante")
public class EstudianteController {
    private final UniversidadService service;

    public EstudianteController(UniversidadService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(Authentication authentication) {
        return service.estudianteDashboard(authentication.getName());
    }

    @GetMapping("/cursos/{id}")
    public Map<String, Object> detalleCurso(@PathVariable Long id, Authentication authentication) {
        return service.detalleCursoEstudiante(authentication.getName(), id);
    }

    @PostMapping("/materiales/{id}/visto")
    public MaterialVisto marcarMaterialVisto(@PathVariable Long id, Authentication authentication) {
        return service.marcarMaterialVisto(authentication.getName(), id);
    }

    @PostMapping("/tareas/{id}/entregar")
    public EntregaTarea entregarTarea(@PathVariable Long id, @RequestBody EntregaTareaRequest request, Authentication authentication) {
        return service.entregarTarea(authentication.getName(), id, request);
    }

    @PostMapping("/evaluaciones/{id}/resolver")
    public RespuestaEvaluacion resolverEvaluacion(@PathVariable Long id, @RequestBody Map<String, Object> respuestas, Authentication authentication) {
        return service.resolverEvaluacion(authentication.getName(), id, respuestas);
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
