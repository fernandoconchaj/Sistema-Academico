package com.sistema.academico.repository;

import com.sistema.academico.entity.ReporteReclamo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ReporteReclamoRepository extends JpaRepository<ReporteReclamo, Long> {
    List<ReporteReclamo> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
    List<ReporteReclamo> findByUsuarioId(Long usuarioId);
    List<ReporteReclamo> findByCursoId(Long cursoId);
    List<ReporteReclamo> findAllByOrderByFechaCreacionDesc();
    long countByEstadoIgnoreCase(String estado);
}
