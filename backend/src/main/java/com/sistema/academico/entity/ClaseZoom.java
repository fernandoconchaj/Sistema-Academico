package com.sistema.academico.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "clases_zoom")
public class ClaseZoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    public Curso curso;

    public String titulo;
    public LocalDate fecha;
    public String hora;
    public String enlace;
    public String grabacion;
    public String salaId;

    public ClaseZoom() {}

    public ClaseZoom(Curso curso, String titulo, LocalDate fecha, String hora, String enlace, String grabacion, String salaId) {
        this.curso = curso;
        this.titulo = titulo;
        this.fecha = fecha;
        this.hora = hora;
        this.enlace = enlace;
        this.grabacion = grabacion;
        this.salaId = salaId;
    }
}
