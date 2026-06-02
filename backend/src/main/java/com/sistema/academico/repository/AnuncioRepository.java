package com.sistema.academico.repository;

import com.sistema.academico.entity.Anuncio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface AnuncioRepository extends JpaRepository<Anuncio, Long> {
    List<Anuncio> findByCursoId(Long cursoId);
    List<Anuncio> findByDocenteId(Long docenteId);
}
