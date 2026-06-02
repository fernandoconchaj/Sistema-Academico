package com.sistema.academico.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "evaluaciones")
public class Evaluacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    public Curso curso;

    public String titulo;

    @Column(length = 1000)
    public String descripcion;

    public LocalDate fecha;
    public Integer duracionMinutos;
    public Integer intentos;
    public Integer puntaje;
    public String estado;

    @Column(length = 6000)
    public String preguntasJson;

    public Evaluacion() {}

    public Evaluacion(Curso curso, String titulo, String descripcion, LocalDate fecha, Integer duracionMinutos, Integer intentos, Integer puntaje, String estado) {
        this.curso = curso;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.duracionMinutos = duracionMinutos;
        this.intentos = intentos;
        this.puntaje = puntaje;
        this.estado = estado;
    }
}
