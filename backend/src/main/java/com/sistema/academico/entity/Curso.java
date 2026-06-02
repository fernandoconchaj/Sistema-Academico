package com.sistema.academico.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cursos")
public class Curso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public String codigo;
    public String nombre;

    @Column(length = 1000)
    public String descripcion;

    public Integer creditos;
    public String ciclo;
    public String modalidad;
    public String categoria;
    public String estado;
    public Integer avance;
    public String color;
    public String aula;
    public String horario;

    @ManyToOne
    @JoinColumn(name = "docente_id")
    public Usuario docente;

    public Curso() {}

    public Curso(String codigo, String nombre, String descripcion, Integer creditos, String ciclo, String modalidad, String categoria, String estado, Integer avance, String color, String aula, String horario, Usuario docente) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.creditos = creditos;
        this.ciclo = ciclo;
        this.modalidad = modalidad;
        this.categoria = categoria;
        this.estado = estado;
        this.avance = avance;
        this.color = color;
        this.aula = aula;
        this.horario = horario;
        this.docente = docente;
    }
}
