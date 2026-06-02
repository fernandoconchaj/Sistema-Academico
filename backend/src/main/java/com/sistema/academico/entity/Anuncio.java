package com.sistema.academico.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "anuncios")
public class Anuncio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    public Curso curso;

    public String titulo;

    @Column(length = 1500)
    public String mensaje;

    public LocalDate fecha;

    @ManyToOne
    @JoinColumn(name = "docente_id")
    public Usuario docente;

    public Anuncio() {}

    public Anuncio(Curso curso, String titulo, String mensaje, LocalDate fecha, Usuario docente) {
        this.curso = curso;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.fecha = fecha;
        this.docente = docente;
    }
}
