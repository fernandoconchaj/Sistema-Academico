package com.sistema.academico.dto;

import java.util.List;

public class CreateCursoRequest {
    public String codigo;
    public String nombre;
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
    public Long docenteId;
    public List<Long> estudianteIds;
}
