package com.sistema.academico.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String nombres;
    public String apellidos;

    @Column(unique = true, nullable = false)
    public String correo;

    @Column(nullable = false)
    public String password;

    @Column(nullable = false)
    public String rol;

    public String estado;
    public String codigo;
    public String especialidad;

    public Usuario() {}

    public Usuario(String nombres, String apellidos, String correo, String password, String rol, String estado, String codigo, String especialidad) {
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.correo = correo;
        this.password = password;
        this.rol = rol;
        this.estado = estado;
        this.codigo = codigo;
        this.especialidad = especialidad;
    }
}
