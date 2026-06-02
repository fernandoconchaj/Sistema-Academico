package com.sistema.academico.repository;

import com.sistema.academico.entity.MensajeChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface MensajeChatRepository extends JpaRepository<MensajeChat, Long> {
    List<MensajeChat> findByCursoId(Long cursoId);

    @Query("""
        select m from MensajeChat m
        where m.curso.id = :cursoId
        and ((m.remitente.id = :usuarioId and m.receptor.id = :otroId)
          or (m.remitente.id = :otroId and m.receptor.id = :usuarioId))
        order by m.fechaHora asc
    """)
    List<MensajeChat> conversacion(@Param("cursoId") Long cursoId, @Param("usuarioId") Long usuarioId, @Param("otroId") Long otroId);

    @Query("""
        select m from MensajeChat m
        where m.remitente.id = :usuarioId or m.receptor.id = :usuarioId
        order by m.fechaHora desc
    """)
    List<MensajeChat> mensajesDelUsuario(@Param("usuarioId") Long usuarioId);
}
