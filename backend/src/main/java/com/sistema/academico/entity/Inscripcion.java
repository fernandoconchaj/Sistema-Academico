package com.sistema.academico.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "inscripciones")
public class Inscripcion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "estudiante_id")
    public Usuario estudiante;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    public Curso curso;

    public LocalDate fecha;
    public String estado;

    public Inscripcion() {}

    public Inscripcion(Usuario estudiante, Curso curso, LocalDate fecha, String estado) {
        this.estudiante = estudiante;
        this.curso = curso;
        this.fecha = fecha;
        this.estado = estado;
    }
}
