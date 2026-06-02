package com.sistema.academico.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "entregas_tarea")
public class EntregaTarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "tarea_id")
    public Tarea tarea;

    @ManyToOne
    @JoinColumn(name = "estudiante_id")
    public Usuario estudiante;

    @Column(length = 1500)
    public String comentario;

    public String archivoNombre;
    public String archivoTipo;

    @Column(columnDefinition = "TEXT")
    public String archivoBase64;

    public LocalDateTime fechaEntrega;
    public String estado;
    public Integer nota;

    @Column(length = 1000)
    public String comentarioDocente;

    public EntregaTarea() {}

    public EntregaTarea(Tarea tarea, Usuario estudiante, String comentario, String archivoNombre, String archivoTipo, String archivoBase64) {
        this.tarea = tarea;
        this.estudiante = estudiante;
        this.comentario = comentario;
        this.archivoNombre = archivoNombre;
        this.archivoTipo = archivoTipo;
        this.archivoBase64 = archivoBase64;
        this.fechaEntrega = LocalDateTime.now();
        this.estado = "Enviado";
    }
}
