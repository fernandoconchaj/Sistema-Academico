package com.sistema.academico.repository;

import com.sistema.academico.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByCursoId(Long cursoId);
}
