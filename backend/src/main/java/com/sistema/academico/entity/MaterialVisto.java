package com.sistema.academico.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "materiales_vistos", uniqueConstraints = @UniqueConstraint(columnNames = {"material_id", "estudiante_id"}))
public class MaterialVisto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "material_id")
    public Material material;

    @ManyToOne
    @JoinColumn(name = "estudiante_id")
    public Usuario estudiante;

    public LocalDateTime fechaVisto;

    public MaterialVisto() {}

    public MaterialVisto(Material material, Usuario estudiante) {
        this.material = material;
        this.estudiante = estudiante;
        this.fechaVisto = LocalDateTime.now();
    }
}
