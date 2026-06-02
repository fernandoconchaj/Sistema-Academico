package com.sistema.academico.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensajes_chat")
public class MensajeChat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    public Curso curso;

    @ManyToOne
    @JoinColumn(name = "remitente_id")
    public Usuario remitente;

    @ManyToOne
    @JoinColumn(name = "receptor_id")
    public Usuario receptor;

    @Column(length = 2000, nullable = false)
    public String texto;

    public String archivoNombre;

    public String archivoTipo;

    @Column(columnDefinition = "TEXT")
    public String archivoBase64;

    public LocalDateTime fechaHora;

    public MensajeChat() {}

    public MensajeChat(Curso curso, Usuario remitente, Usuario receptor, String texto, LocalDateTime fechaHora) {
        this.curso = curso;
        this.remitente = remitente;
        this.receptor = receptor;
        this.texto = texto;
        this.fechaHora = fechaHora;
    }

    public MensajeChat(Curso curso, Usuario remitente, Usuario receptor, String texto, String archivoNombre, String archivoTipo, String archivoBase64, LocalDateTime fechaHora) {
        this.curso = curso;
        this.remitente = remitente;
        this.receptor = receptor;
        this.texto = texto;
        this.archivoNombre = archivoNombre;
        this.archivoTipo = archivoTipo;
        this.archivoBase64 = archivoBase64;
        this.fechaHora = fechaHora;
    }
}
