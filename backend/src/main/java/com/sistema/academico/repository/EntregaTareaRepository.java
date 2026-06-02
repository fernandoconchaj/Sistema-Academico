package com.sistema.academico.repository;

import com.sistema.academico.entity.EntregaTarea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface EntregaTareaRepository extends JpaRepository<EntregaTarea, Long> {
    List<EntregaTarea> findByTareaId(Long tareaId);
    List<EntregaTarea> findByEstudianteId(Long estudianteId);
    Optional<EntregaTarea> findByTareaIdAndEstudianteId(Long tareaId, Long estudianteId);
}
