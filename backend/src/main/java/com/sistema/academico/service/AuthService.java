package com.sistema.academico.service;

import com.sistema.academico.config.JwtService;
import com.sistema.academico.dto.*;
import com.sistema.academico.entity.Usuario;
import com.sistema.academico.repository.UsuarioRepository;
import com.sistema.academico.util.TextoUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse login(LoginRequest request) {
        String correo = TextoUtil.requerido(request.correo, "correo");
        String password = TextoUtil.requerido(request.password, "password");

        Usuario usuario = buscarUsuario(correo);
        if (!passwordEncoder.matches(password, usuario.password)) {
            throw new RuntimeException("Correo o contraseña incorrectos");
        }
        if (!cuentaActiva(usuario)) {
            throw new RuntimeException("Tu cuenta esta inactiva. Comunicate con el administrador para recuperar el acceso.");
        }
        log.info("Inicio de sesion correcto: {}", usuario.correo);
        String token = jwtService.generateToken(usuario);
        return new AuthResponse(usuario.id, usuario.nombres, usuario.apellidos, usuario.correo, usuario.rol, usuario.estado, token);
    }

    private Usuario buscarUsuario(String correo) {
        return usuarioRepository.findByCorreo(correo)
                .or(() -> usuarioRepository.findByCorreo(correoAlternativo(correo)))
                .orElseThrow(() -> new RuntimeException("Correo o contraseña incorrectos"));
    }

    private String correoAlternativo(String correo) {
        String dominio = "@universidad.edu.pe";
        if (!correo.endsWith(dominio)) return correo;
        return correo.substring(0, correo.length() - dominio.length()) + "@" + "u" + "ta.edu.pe";
    }

    private boolean cuentaActiva(Usuario usuario) {
        return usuario.estado == null || usuario.estado.equalsIgnoreCase("Activo");
    }

    public AuthResponse register(RegisterRequest request) {
        String nombres = TextoUtil.requerido(request.nombres, "nombres");
        String apellidos = TextoUtil.requerido(request.apellidos, "apellidos");
        String correo = TextoUtil.requerido(request.correo, "correo");
        String password = TextoUtil.requerido(request.password, "password");

        if (usuarioRepository.findByCorreo(correo).isPresent()) {
            throw new RuntimeException("El correo ya esta registrado");
        }
        String rol = request.rol == null || request.rol.isBlank() ? "ESTUDIANTE" : request.rol.toUpperCase();
        if (!rol.equals("ESTUDIANTE") && !rol.equals("DOCENTE")) {
            throw new RuntimeException("Solo se permite registrar estudiantes o docentes desde el formulario publico");
        }
        Usuario usuario = new Usuario(
                nombres,
                apellidos,
                correo,
                passwordEncoder.encode(password),
                rol,
                "Activo",
                rol.equals("DOCENTE") ? "DOC" + System.currentTimeMillis() : "EST" + System.currentTimeMillis(),
                request.especialidad
        );
        usuarioRepository.save(usuario);
        log.info("Registro nuevo usuario: {} con rol {}", usuario.correo, usuario.rol);
        String token = jwtService.generateToken(usuario);
        return new AuthResponse(usuario.id, usuario.nombres, usuario.apellidos, usuario.correo, usuario.rol, usuario.estado, token);
    }
}
