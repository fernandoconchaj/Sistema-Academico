package com.sistema.academico.repository;

import com.sistema.academico.entity.Inscripcion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {
    List<Inscripcion> findByEstudianteId(Long estudianteId);
    List<Inscripcion> findByCursoId(Long cursoId);
}
