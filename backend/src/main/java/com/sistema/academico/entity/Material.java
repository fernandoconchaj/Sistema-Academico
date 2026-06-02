package com.sistema.academico.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "materiales")
public class Material {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    public Curso curso;

    public String semana;
    public String titulo;
    public String tipo;
    public String url;
    public String estado;

    @Column(length = 5000)
    public String contenido;

    public String archivoNombre;
    public String archivoTipo;

    @Column(columnDefinition = "TEXT")
    public String archivoBase64;

    public Material() {}

    public Material(Curso curso, String semana, String titulo, String tipo, String url, String estado) {
        this(curso, semana, titulo, tipo, url, estado, null, null);
    }

    public Material(Curso curso, String semana, String titulo, String tipo, String url, String estado, String contenido, String archivoNombre) {
        this.curso = curso;
        this.semana = semana;
        this.titulo = titulo;
        this.tipo = tipo;
        this.url = url;
        this.estado = estado;
        this.contenido = contenido;
        this.archivoNombre = archivoNombre;
    }

    public Material(Curso curso, String semana, String titulo, String tipo, String url, String estado, String contenido, String archivoNombre, String archivoTipo, String archivoBase64) {
        this(curso, semana, titulo, tipo, url, estado, contenido, archivoNombre);
        this.archivoTipo = archivoTipo;
        this.archivoBase64 = archivoBase64;
    }
}
