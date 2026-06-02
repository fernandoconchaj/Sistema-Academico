package com.sistema.academico.controller;

import com.sistema.academico.dto.*;
import com.sistema.academico.entity.*;
import com.sistema.academico.service.UniversidadService;
import com.sistema.academico.service.ReporteExcelService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UniversidadService service;
    private final ReporteExcelService reporteExcelService;

    public AdminController(UniversidadService service, ReporteExcelService reporteExcelService) {
        this.service = service;
        this.reporteExcelService = reporteExcelService;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return service.adminDashboard();
    }

    @PostMapping("/usuarios")
    public Usuario crearUsuario(@RequestBody RegisterRequest request) {
        return service.crearUsuario(request);
    }

    @PutMapping("/usuarios/{id}")
    public Usuario actualizarUsuario(@PathVariable Long id, @RequestBody RegisterRequest request) {
        return service.actualizarUsuario(id, request);
    }

    @DeleteMapping("/usuarios/{id}")
    public Map<String, String> eliminarUsuario(@PathVariable Long id) {
        service.eliminarUsuario(id);
        return Map.of("estado", "Usuario eliminado");
    }

    @PostMapping("/cursos")
    public Curso crearCurso(@RequestBody CreateCursoRequest request) {
        return service.crearCurso(request);
    }

    @PutMapping("/cursos/{id}")
    public Curso actualizarCurso(@PathVariable Long id, @RequestBody CreateCursoRequest request) {
        return service.actualizarCurso(id, request);
    }

    @DeleteMapping("/cursos/{id}")
    public Map<String, String> eliminarCurso(@PathVariable Long id) {
        service.eliminarCurso(id);
        return Map.of("estado", "Curso eliminado");
    }

    @PostMapping("/inscripciones")
    public Inscripcion matricular(@RequestBody Map<String, Long> request) {
        return service.matricular(request.get("estudianteId"), request.get("cursoId"));
    }

    @DeleteMapping("/inscripciones/{id}")
    public Map<String, String> quitarMatricula(@PathVariable Long id) {
        service.quitarMatricula(id);
        return Map.of("estado", "Matricula eliminada");
    }

    @PatchMapping("/usuarios/{id}/estado")
    public Usuario cambiarEstado(@PathVariable Long id) {
        return service.cambiarEstadoUsuario(id);
    }

    @PutMapping("/usuarios/{id}/estado")
    public Usuario cambiarEstadoPut(@PathVariable Long id) {
        return service.cambiarEstadoUsuario(id);
    }

    @GetMapping("/reportes")
    public Map<String, Object> reportes() {
        return service.reportes();
    }

    @GetMapping("/reclamos")
    public List<ReporteReclamo> reclamos() {
        return service.reportesReclamosAdmin();
    }

    @GetMapping("/reportes/excel")
    public ResponseEntity<byte[]> descargarReporteExcel() {
        byte[] archivo = reporteExcelService.generarReporteGeneral();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sistema-academico-reporte.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(archivo);
    }


    @PutMapping("/reclamos/{id}")
    public ReporteReclamo responderReclamo(@PathVariable Long id, @RequestBody ResponderReporteRequest request) {
        return service.responderReporte(id, request);
    }
}
