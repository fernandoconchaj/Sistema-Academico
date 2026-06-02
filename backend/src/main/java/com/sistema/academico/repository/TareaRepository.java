package com.sistema.academico.repository;

import com.sistema.academico.entity.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface TareaRepository extends JpaRepository<Tarea, Long> {
    List<Tarea> findByCursoId(Long cursoId);
}
