package com.sistema.academico.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reportes_reclamos")
public class ReporteReclamo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    public Usuario usuario;

    @ManyToOne
    public Curso curso;

    public String rol;
    public String tipo;
    public String asunto;

    @Column(length = 3000)
    public String descripcion;

    public String estado;
    public String prioridad;
    public String archivoNombre;
    public String archivoTipo;

    @Column(length = 2000000)
    public String archivoBase64;

    public LocalDateTime fechaCreacion;
    public LocalDateTime fechaRespuesta;

    @Column(length = 3000)
    public String respuestaAdmin;

    public ReporteReclamo() {}

    public ReporteReclamo(Usuario usuario, Curso curso, String tipo, String asunto, String descripcion, String prioridad) {
        this.usuario = usuario;
        this.curso = curso;
        this.rol = usuario.rol;
        this.tipo = tipo;
        this.asunto = asunto;
        this.descripcion = descripcion;
        this.prioridad = prioridad;
        this.estado = "Pendiente";
        this.fechaCreacion = LocalDateTime.now();
    }
}
