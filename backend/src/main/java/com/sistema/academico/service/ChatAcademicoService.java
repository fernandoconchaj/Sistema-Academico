package com.sistema.academico.service;

import com.sistema.academico.dto.CreateMensajeRequest;
import com.sistema.academico.entity.*;
import com.sistema.academico.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ChatAcademicoService {
    private final AcademicAccessService access;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final InscripcionRepository inscripcionRepository;
    private final MensajeChatRepository mensajeChatRepository;

    public ChatAcademicoService(AcademicAccessService access, UsuarioRepository usuarioRepository,
                                CursoRepository cursoRepository, InscripcionRepository inscripcionRepository,
                                MensajeChatRepository mensajeChatRepository) {
        this.access = access;
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
        this.inscripcionRepository = inscripcionRepository;
        this.mensajeChatRepository = mensajeChatRepository;
    }

    public List<Curso> chatCursos(String correo) {
        Usuario usuario = access.currentUser(correo);
        if ("DOCENTE".equalsIgnoreCase(usuario.rol)) return cursoRepository.findByDocenteId(usuario.id);
        if ("ADMIN".equalsIgnoreCase(usuario.rol)) return cursoRepository.findAll();
        return access.cursosDelEstudiante(usuario.id);
    }

    public List<Map<String, Object>> chatContactos(String correo, Long cursoId, String q) {
        Usuario actual = access.currentUser(correo);
        Curso curso = cursoRepository.findById(cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        access.validarParticipacionCurso(actual, curso);
        String filtro = q == null ? "" : q.trim().toLowerCase();
        Map<Long, Usuario> usuarios = new LinkedHashMap<>();
        if (curso.docente != null) usuarios.put(curso.docente.id, curso.docente);
        for (Inscripcion inscripcion : inscripcionRepository.findByCursoId(cursoId)) if (inscripcion.estudiante != null) usuarios.put(inscripcion.estudiante.id, inscripcion.estudiante);
        return usuarios.values().stream()
                .filter(u -> !Objects.equals(u.id, actual.id))
                .filter(u -> filtro.isBlank() || access.contieneTexto(u.nombres, filtro) || access.contieneTexto(u.apellidos, filtro) || access.contieneTexto(u.correo, filtro) || access.contieneTexto(u.rol, filtro))
                .map(u -> contactoMap(u, curso, actual.id)).toList();
    }

    public List<Map<String, Object>> chatConversaciones(String correo) {
        Usuario actual = access.currentUser(correo);
        Map<String, Map<String, Object>> conversaciones = new LinkedHashMap<>();
        for (MensajeChat mensaje : mensajeChatRepository.mensajesDelUsuario(actual.id)) {
            Usuario otro = Objects.equals(mensaje.remitente.id, actual.id) ? mensaje.receptor : mensaje.remitente;
            String key = mensaje.curso.id + "-" + otro.id;
            if (!conversaciones.containsKey(key)) {
                Map<String, Object> c = contactoMap(otro, mensaje.curso, actual.id);
                c.put("ultimoMensaje", mensaje.archivoNombre != null && !mensaje.archivoNombre.isBlank() ? "Archivo: " + mensaje.archivoNombre : mensaje.texto);
                c.put("fecha", mensaje.fechaHora.toString());
                conversaciones.put(key, c);
            }
        }
        return new ArrayList<>(conversaciones.values());
    }

    public List<Map<String, Object>> chatMensajes(String correo, Long cursoId, Long usuarioId) {
        Usuario actual = access.currentUser(correo);
        Curso curso = cursoRepository.findById(cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        access.validarParticipacionCurso(actual, curso);
        return mensajeChatRepository.conversacion(cursoId, actual.id, usuarioId).stream().map(m -> mensajeMap(m, actual.id)).toList();
    }

    public Map<String, Object> enviarMensaje(String correo, CreateMensajeRequest r) {
        Usuario remitente = access.currentUser(correo);
        Usuario receptor = usuarioRepository.findById(r.receptorId).orElseThrow(() -> new RuntimeException("Usuario destino no encontrado"));
        Curso curso = cursoRepository.findById(r.cursoId).orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        access.validarParticipacionCurso(remitente, curso);
        access.validarParticipacionCurso(receptor, curso);
        boolean tieneTexto = r.texto != null && !r.texto.trim().isBlank();
        boolean tieneArchivo = r.archivoBase64 != null && !r.archivoBase64.trim().isBlank() && r.archivoNombre != null && !r.archivoNombre.trim().isBlank();
        if (!tieneTexto && !tieneArchivo) throw new RuntimeException("Debes escribir un mensaje o adjuntar un archivo");
        String textoFinal = tieneTexto ? r.texto.trim() : "Archivo adjunto: " + r.archivoNombre.trim();
        MensajeChat guardado = mensajeChatRepository.save(new MensajeChat(curso, remitente, receptor, textoFinal,
                tieneArchivo ? r.archivoNombre.trim() : null,
                tieneArchivo ? (r.archivoTipo == null || r.archivoTipo.isBlank() ? "application/octet-stream" : r.archivoTipo) : null,
                tieneArchivo ? r.archivoBase64 : null,
                java.time.LocalDateTime.now()));
        return mensajeMap(guardado, remitente.id);
    }

    private Map<String, Object> mensajeMap(MensajeChat m, Long actualId) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.id); map.put("texto", m.texto); map.put("archivoNombre", m.archivoNombre);
        map.put("archivoTipo", m.archivoTipo); map.put("archivoBase64", m.archivoBase64); map.put("fechaHora", m.fechaHora.toString());
        map.put("remitenteId", m.remitente.id); map.put("receptorId", m.receptor.id);
        map.put("from", Objects.equals(m.remitente.id, actualId) ? "me" : "other");
        return map;
    }

    private Map<String, Object> contactoMap(Usuario u, Curso curso, Long actualId) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", u.id); map.put("nombres", u.nombres); map.put("apellidos", u.apellidos);
        map.put("nombreCompleto", ((u.nombres == null ? "" : u.nombres) + " " + (u.apellidos == null ? "" : u.apellidos)).trim());
        map.put("correo", u.correo); map.put("rol", u.rol); map.put("estado", u.estado); map.put("cursoId", curso.id); map.put("cursoNombre", curso.nombre);
        map.put("enLinea", "Activo".equalsIgnoreCase(u.estado));
        List<MensajeChat> mensajes = mensajeChatRepository.conversacion(curso.id, actualId, u.id);
        if (!mensajes.isEmpty()) {
            MensajeChat ultimo = mensajes.get(mensajes.size() - 1);
            map.put("ultimoMensaje", ultimo.archivoNombre != null && !ultimo.archivoNombre.isBlank() ? "Archivo: " + ultimo.archivoNombre : ultimo.texto);
            map.put("fecha", ultimo.fechaHora.toString());
        } else {
            map.put("ultimoMensaje", "Sin mensajes todavia");
            map.put("fecha", "Nuevo");
        }
        return map;
    }
}
