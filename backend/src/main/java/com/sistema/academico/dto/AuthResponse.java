package com.sistema.academico.dto;

public class AuthResponse {
    public Long id;
    public String nombres;
    public String apellidos;
    public String correo;
    public String rol;
    public String estado;
    public String token;

    public AuthResponse(Long id, String nombres, String apellidos, String correo, String rol, String estado, String token) {
        this.id = id;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.correo = correo;
        this.rol = rol;
        this.estado = estado;
        this.token = token;
    }
}
