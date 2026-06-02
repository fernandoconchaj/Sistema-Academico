package com.sistema.academico.repository;

import com.sistema.academico.entity.MaterialVisto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface MaterialVistoRepository extends JpaRepository<MaterialVisto, Long> {
    Optional<MaterialVisto> findByMaterialIdAndEstudianteId(Long materialId, Long estudianteId);
    List<MaterialVisto> findByMaterialId(Long materialId);
    List<MaterialVisto> findByMaterialCursoId(Long cursoId);
    List<MaterialVisto> findByEstudianteId(Long estudianteId);
    Long countByMaterialCursoIdAndEstudianteId(Long cursoId, Long estudianteId);
}
