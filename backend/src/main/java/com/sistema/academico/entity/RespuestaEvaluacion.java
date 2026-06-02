package com.sistema.academico.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "respuestas_evaluacion")
public class RespuestaEvaluacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "evaluacion_id")
    public Evaluacion evaluacion;

    @ManyToOne
    @JoinColumn(name = "estudiante_id")
    public Usuario estudiante;

    @Column(columnDefinition = "TEXT")
    public String respuestasJson;

    public LocalDateTime fechaEnvio;
    public String estado;
    public Integer puntaje;
    public Integer intento;
    public Integer intentosAutorizados;
    public LocalDateTime fechaInicio;
    public LocalDateTime fechaCierre;
    public Integer tiempoUsadoSegundos;

    @Column(length = 1000)
    public String comentarioDocente;

    public RespuestaEvaluacion() {}

    public RespuestaEvaluacion(Evaluacion evaluacion, Usuario estudiante, String respuestasJson, Integer puntaje) {
        this.evaluacion = evaluacion;
        this.estudiante = estudiante;
        this.respuestasJson = respuestasJson;
        this.fechaEnvio = LocalDateTime.now();
        this.estado = "Finalizado";
        this.puntaje = puntaje;
        this.intento = 1;
        this.intentosAutorizados = 0;
    }
}
