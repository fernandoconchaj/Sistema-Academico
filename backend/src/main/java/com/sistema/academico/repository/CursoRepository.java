package com.sistema.academico.repository;

import com.sistema.academico.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CursoRepository extends JpaRepository<Curso, Long> {
    List<Curso> findByDocenteId(Long docenteId);
}
