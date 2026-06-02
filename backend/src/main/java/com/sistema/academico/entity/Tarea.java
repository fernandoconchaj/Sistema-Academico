package com.sistema.academico.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tareas")
public class Tarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    public Curso curso;

    public String titulo;

    @Column(length = 1000)
    public String descripcion;

    public LocalDate fechaLimite;
    public Integer puntaje;
    public String estado;

    public String archivoNombre;
    public String archivoTipo;

    @Column(columnDefinition = "TEXT")
    public String archivoBase64;

    public String urlArchivo;

    public Tarea() {}

    public Tarea(Curso curso, String titulo, String descripcion, LocalDate fechaLimite, Integer puntaje, String estado) {
        this.curso = curso;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaLimite = fechaLimite;
        this.puntaje = puntaje;
        this.estado = estado;
    }
}
