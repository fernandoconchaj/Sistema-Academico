package com.sistema.academico.service;

import com.google.common.collect.ImmutableList;
import com.sistema.academico.entity.Curso;
import com.sistema.academico.entity.Usuario;
import com.sistema.academico.repository.CursoRepository;
import com.sistema.academico.repository.UsuarioRepository;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ReporteExcelService {
    private static final Logger log = LoggerFactory.getLogger(ReporteExcelService.class);

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;

    public ReporteExcelService(UsuarioRepository usuarioRepository, CursoRepository cursoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
    }

    public byte[] generarReporteGeneral() {
        log.info("Generando reporte general en Excel");

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            crearHojaUsuarios(workbook, usuarioRepository.findAll());
            crearHojaCursos(workbook, cursoRepository.findAll());
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Error al generar reporte general", e);
            throw new RuntimeException("No se pudo generar el reporte Excel");
        }
    }

    private void crearHojaUsuarios(Workbook workbook, List<Usuario> usuarios) {
        Sheet sheet = workbook.createSheet("Usuarios");
        List<String> cabeceras = ImmutableList.of("ID", "Nombres", "Apellidos", "Correo", "Rol", "Estado");
        crearCabecera(sheet, cabeceras);

        int fila = 1;
        for (Usuario u : usuarios) {
            Row row = sheet.createRow(fila++);
            row.createCell(0).setCellValue(u.id == null ? 0 : u.id);
            row.createCell(1).setCellValue(texto(u.nombres));
            row.createCell(2).setCellValue(texto(u.apellidos));
            row.createCell(3).setCellValue(texto(u.correo));
            row.createCell(4).setCellValue(texto(u.rol));
            row.createCell(5).setCellValue(texto(u.estado));
        }
        ajustarColumnas(sheet, cabeceras.size());
    }

    private void crearHojaCursos(Workbook workbook, List<Curso> cursos) {
        Sheet sheet = workbook.createSheet("Cursos");
        List<String> cabeceras = ImmutableList.of("ID", "Codigo", "Nombre", "Ciclo", "Modalidad", "Docente", "Estado");
        crearCabecera(sheet, cabeceras);

        int fila = 1;
        for (Curso c : cursos) {
            Row row = sheet.createRow(fila++);
            row.createCell(0).setCellValue(c.id == null ? 0 : c.id);
            row.createCell(1).setCellValue(texto(c.codigo));
            row.createCell(2).setCellValue(texto(c.nombre));
            row.createCell(3).setCellValue(texto(c.ciclo));
            row.createCell(4).setCellValue(texto(c.modalidad));
            row.createCell(5).setCellValue(c.docente == null ? "Sin docente" : texto(c.docente.nombres + " " + c.docente.apellidos));
            row.createCell(6).setCellValue(texto(c.estado));
        }
        ajustarColumnas(sheet, cabeceras.size());
    }

    private void crearCabecera(Sheet sheet, List<String> cabeceras) {
        Row header = sheet.createRow(0);
        for (int i = 0; i < cabeceras.size(); i++) {
            header.createCell(i).setCellValue(cabeceras.get(i));
        }
    }

    private void ajustarColumnas(Sheet sheet, int cantidad) {
        for (int i = 0; i < cantidad; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private String texto(String valor) {
        return StringUtils.defaultIfBlank(valor, "-");
    }
}
