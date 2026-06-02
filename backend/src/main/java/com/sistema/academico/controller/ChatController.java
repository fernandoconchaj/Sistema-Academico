package com.sistema.academico.controller;

import com.sistema.academico.dto.CreateMensajeRequest;
import com.sistema.academico.entity.Curso;
import com.sistema.academico.service.UniversidadService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    private final UniversidadService service;

    public ChatController(UniversidadService service) {
        this.service = service;
    }

    @GetMapping("/cursos")
    public List<Curso> cursos(Authentication authentication) {
        return service.chatCursos(authentication.getName());
    }

    @GetMapping("/contactos")
    public List<Map<String, Object>> contactos(Authentication authentication, @RequestParam Long cursoId, @RequestParam(required = false) String q) {
        return service.chatContactos(authentication.getName(), cursoId, q);
    }

    @GetMapping("/conversaciones")
    public List<Map<String, Object>> conversaciones(Authentication authentication) {
        return service.chatConversaciones(authentication.getName());
    }

    @GetMapping("/mensajes")
    public List<Map<String, Object>> mensajes(Authentication authentication, @RequestParam Long cursoId, @RequestParam Long usuarioId) {
        return service.chatMensajes(authentication.getName(), cursoId, usuarioId);
    }

    @PostMapping("/mensajes")
    public Map<String, Object> enviar(Authentication authentication, @RequestBody CreateMensajeRequest request) {
        return service.enviarMensaje(authentication.getName(), request);
    }
}
