package com.sistema.academico.repository;

import com.sistema.academico.entity.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {
    List<Evaluacion> findByCursoId(Long cursoId);
}
