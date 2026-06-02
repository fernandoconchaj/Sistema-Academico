package com.sistema.academico.controller;

import com.sistema.academico.entity.Curso;
import com.sistema.academico.service.UniversidadService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final UniversidadService service;

    public PublicController(UniversidadService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("estado", "Servicio activo");
    }

    @GetMapping("/cursos")
    public List<Curso> cursos() {
        return service.cursosPublicos();
    }
}
