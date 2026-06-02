package com.sistema.academico.service;

import com.sistema.academico.entity.*;
import com.sistema.academico.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AcademicAccessService {
    private final UsuarioRepository usuarioRepository;
    private final InscripcionRepository inscripcionRepository;

    public AcademicAccessService(UsuarioRepository usuarioRepository, InscripcionRepository inscripcionRepository) {
        this.usuarioRepository = usuarioRepository;
        this.inscripcionRepository = inscripcionRepository;
    }

    public Usuario currentUser(String correo) {
        return usuarioRepository.findByCorreo(correo).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public List<Curso> cursosDelEstudiante(Long estudianteId) {
        return inscripcionRepository.findByEstudianteId(estudianteId).stream().map(i -> i.curso).filter(Objects::nonNull).toList();
    }

    public List<Usuario> estudiantesMatriculados(Long cursoId) {
        return inscripcionRepository.findByCursoId(cursoId).stream().map(i -> i.estudiante).filter(Objects::nonNull).toList();
    }

    public void validarCursoDelDocente(Usuario docente, Curso curso) {
        if (curso == null || curso.docente == null || !Objects.equals(curso.docente.id, docente.id)) {
            throw new RuntimeException("No tienes permisos sobre este curso");
        }
    }

    public void validarEstudianteMatriculado(Long estudianteId, Long cursoId) {
        boolean ok = inscripcionRepository.findByEstudianteId(estudianteId).stream()
                .anyMatch(i -> i.curso != null && Objects.equals(i.curso.id, cursoId));
        if (!ok) throw new RuntimeException("El estudiante no esta matriculado en este curso");
    }

    public void validarParticipacionCurso(Usuario usuario, Curso curso) {
        if ("ADMIN".equalsIgnoreCase(usuario.rol)) return;
        if ("DOCENTE".equalsIgnoreCase(usuario.rol)) {
            validarCursoDelDocente(usuario, curso);
            return;
        }
        validarEstudianteMatriculado(usuario.id, curso.id);
    }

    public boolean contieneTexto(String value, String filtro) {
        return value != null && value.toLowerCase().contains(filtro);
    }
}
