package com.sistema.academico.repository;

import com.sistema.academico.entity.RespuestaEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface RespuestaEvaluacionRepository extends JpaRepository<RespuestaEvaluacion, Long> {
    List<RespuestaEvaluacion> findByEvaluacionId(Long evaluacionId);
    List<RespuestaEvaluacion> findByEstudianteId(Long estudianteId);
    Optional<RespuestaEvaluacion> findByEvaluacionIdAndEstudianteId(Long evaluacionId, Long estudianteId);
}
