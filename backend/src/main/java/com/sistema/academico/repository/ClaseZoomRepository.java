package com.sistema.academico.repository;

import com.sistema.academico.entity.ClaseZoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ClaseZoomRepository extends JpaRepository<ClaseZoom, Long> {
    List<ClaseZoom> findByCursoId(Long cursoId);
}
