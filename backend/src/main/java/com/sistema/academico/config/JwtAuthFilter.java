package com.sistema.academico.config;

import com.sistema.academico.entity.Usuario;
import com.sistema.academico.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtService.isValid(token)) {
                String correo = jwtService.getCorreo(token);
                Usuario usuario = usuarioRepository.findByCorreo(correo).orElse(null);
                if (usuario != null && cuentaActiva(usuario)) {
                    var auth = new UsernamePasswordAuthenticationToken(
                            usuario.correo,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + usuario.rol))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else if (usuario != null) {
                    SecurityContextHolder.clearContext();
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\":\"Tu cuenta esta inactiva. Comunicate con el administrador para recuperar el acceso.\"}");
                    return;
                }
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean cuentaActiva(Usuario usuario) {
        return usuario.estado == null || usuario.estado.equalsIgnoreCase("Activo");
    }
}
