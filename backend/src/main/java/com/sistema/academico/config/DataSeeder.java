package com.sistema.academico.config;

import com.sistema.academico.entity.*;
import com.sistema.academico.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedData(
            UsuarioRepository usuarioRepository,
            CursoRepository cursoRepository,
            InscripcionRepository inscripcionRepository,
            MaterialRepository materialRepository,
            TareaRepository tareaRepository,
            EvaluacionRepository evaluacionRepository,
            ClaseZoomRepository claseZoomRepository,
            AnuncioRepository anuncioRepository,
            PasswordEncoder encoder
    ) {
        return args -> {
            actualizarCorreosInstitucionales(usuarioRepository);
            if (usuarioRepository.count() > 0) return;

            Usuario admin = usuarioRepository.save(new Usuario("Administrador", "Sistema", "admin@universidad.edu.pe", encoder.encode("12345"), "ADMIN", "Activo", "ADM001", "Gestion academica"));
            Usuario docenteWeb = usuarioRepository.save(new Usuario("Carlos", "Ramirez", "docente@universidad.edu.pe", encoder.encode("12345"), "DOCENTE", "Activo", "DOC001", "Desarrollo Web"));
            Usuario docenteMate = usuarioRepository.save(new Usuario("Rosa", "Delgado", "mate@universidad.edu.pe", encoder.encode("12345"), "DOCENTE", "Activo", "DOC002", "Matematica"));
            Usuario docenteFisica = usuarioRepository.save(new Usuario("Miguel", "Torres", "fisica@universidad.edu.pe", encoder.encode("12345"), "DOCENTE", "Activo", "DOC003", "Fisica"));
            Usuario estudiante = usuarioRepository.save(new Usuario("Fernando", "Jose", "estudiante@universidad.edu.pe", encoder.encode("12345"), "ESTUDIANTE", "Activo", "EST001", "Ingenieria de Sistemas"));

            Curso web = cursoRepository.save(new Curso("IS-601", "Marcos de Desarrollo Web", "Curso orientado al desarrollo web moderno usando React, Spring Boot y bases de datos relacionales.", 4, "2026-1", "Virtual 24/7", "Desarrollo Web", "Activo", 68, "blue", "Laboratorio B-204", "Lunes 08:00 - 10:00", docenteWeb));
            Curso calculo = cursoRepository.save(new Curso("MAT-401", "Calculo Integral", "Fundamentos de integrales, aplicaciones y solucion de problemas matematicos.", 5, "2026-1", "Presencial", "Matematica", "Activo", 42, "green", "Aula A-305", "Miercoles 10:00 - 12:00", docenteMate));
            Curso fisica = cursoRepository.save(new Curso("FIS-301", "Fisica I", "Mecanica, movimiento, fuerzas y energia aplicada a problemas de ingenieria.", 4, "2026-1", "Virtual", "Ciencias", "Activo", 55, "orange", "Laboratorio F-101", "Viernes 14:00 - 16:00", docenteFisica));
            Curso seguridad = cursoRepository.save(new Curso("IS-701", "Seguridad Informatica", "Fundamentos de seguridad, amenazas, controles y buenas practicas en aplicaciones web.", 4, "2026-1", "Virtual 24/7", "Ciberseguridad", "Activo", 33, "purple", "Aula C-110", "Sabado 09:00 - 11:00", docenteWeb));

            inscripcionRepository.save(new Inscripcion(estudiante, web, LocalDate.now(), "Matriculado"));
            inscripcionRepository.save(new Inscripcion(estudiante, calculo, LocalDate.now(), "Matriculado"));
            inscripcionRepository.save(new Inscripcion(estudiante, fisica, LocalDate.now(), "Matriculado"));
            inscripcionRepository.save(new Inscripcion(estudiante, seguridad, LocalDate.now(), "Matriculado"));

            materialRepository.save(new Material(web, "Semana 01", "Introduccion a frameworks web", "PDF", "https://example.com/material1.pdf", "Revisado", "Los frameworks web permiten construir aplicaciones de forma organizada. En esta semana se revisa la diferencia entre frontend, backend, API REST, componentes y arquitectura por capas. React se utiliza para interfaces modernas y Spring Boot para exponer servicios conectados a PostgreSQL.", "S01_Frameworks_Web.pdf"));
            materialRepository.save(new Material(web, "Semana 02", "React y componentes", "PDF", "https://example.com/material2.pdf", "Pendiente", "React trabaja mediante componentes reutilizables, propiedades, estados y eventos. Tailwind permite aplicar estilos rapidamente con clases utilitarias. El objetivo es crear interfaces limpias, responsivas y faciles de mantener.", "S02_React_Componentes.pdf"));
            materialRepository.save(new Material(web, "Semana 03", "APIs REST con Spring Boot", "PDF", "https://example.com/lab3.pdf", "Nuevo", "Una API REST permite comunicar el frontend con el backend usando endpoints HTTP. En Spring Boot se crean controladores, servicios, repositorios y entidades JPA para exponer datos de cursos, tareas, evaluaciones y mensajes.", "S03_APIs_REST_SpringBoot.pdf"));
            materialRepository.save(new Material(calculo, "Semana 01", "Tecnicas de integracion", "PDF", "https://example.com/calculo.pdf", "Revisado", "Resumen de integrales inmediatas, integracion por partes, sustitucion y aplicaciones al calculo de areas. Incluye ejemplos resueltos y ejercicios propuestos.", "S01_Tecnicas_Integracion.pdf"));
            materialRepository.save(new Material(fisica, "Semana 01", "Leyes de Newton", "PDF", "https://example.com/fisica.pdf", "Revisado", "Material sobre primera, segunda y tercera ley de Newton, diagramas de cuerpo libre y problemas aplicados a sistemas mecanicos simples.", "S01_Leyes_Newton.pdf"));

            tareaRepository.save(new Tarea(web, "Laboratorio React + Tailwind", "Construir una interfaz responsive con componentes reutilizables.", LocalDate.now().plusDays(7), 20, "Por entregar"));
            tareaRepository.save(new Tarea(calculo, "Practica de integrales", "Resolver ejercicios de integracion por partes.", LocalDate.now().plusDays(5), 20, "Por entregar"));
            tareaRepository.save(new Tarea(fisica, "Informe Leyes de Newton", "Desarrollar un informe corto con ejemplos aplicados.", LocalDate.now().plusDays(10), 20, "Por entregar"));

            Evaluacion evWeb = new Evaluacion(web, "Evaluacion Parcial - Spring Boot", "Evaluacion de conceptos de MVC, JPA y REST.", LocalDate.now().plusDays(12), 30, 1, 20, "Disponible"); asignarPreguntas(evWeb); evaluacionRepository.save(evWeb);
            Evaluacion evCalculo = new Evaluacion(calculo, "Evaluacion de Integrales", "Preguntas de seleccion sobre metodos de integracion.", LocalDate.now().plusDays(8), 40, 1, 20, "Disponible"); asignarPreguntas(evCalculo); evaluacionRepository.save(evCalculo);
            Evaluacion evFisica = new Evaluacion(fisica, "Quiz de Cinematica", "Evaluacion corta de movimiento rectilineo.", LocalDate.now().plusDays(9), 25, 1, 20, "Disponible"); asignarPreguntas(evFisica); evaluacionRepository.save(evFisica);

            claseZoomRepository.save(new ClaseZoom(web, "Clase 04 - Consumo de APIs", LocalDate.now().plusDays(2), "19:00", "https://zoom.us/j/123456789", "https://example.com/grabacion-web", "895 632 441"));
            claseZoomRepository.save(new ClaseZoom(calculo, "Clase 05 - Integrales por partes", LocalDate.now().plusDays(3), "18:00", "https://zoom.us/j/987654321", "https://example.com/grabacion-calculo", "842 303 462"));
            claseZoomRepository.save(new ClaseZoom(fisica, "Clase 03 - Dinamica", LocalDate.now().plusDays(4), "20:00", "https://zoom.us/j/555666777", "https://example.com/grabacion-fisica", "882 906 918"));

            anuncioRepository.save(new Anuncio(web, "Recordatorio de laboratorio", "No olvidar subir avance del proyecto en GitHub.", LocalDate.now(), docenteWeb));
            anuncioRepository.save(new Anuncio(web, "Material nuevo disponible", "Se subio la guia de ejercicios de Spring Boot.", LocalDate.now(), docenteWeb));
            anuncioRepository.save(new Anuncio(calculo, "Practica dirigida", "Revisar los ejercicios propuestos antes de clase.", LocalDate.now(), docenteMate));
        };
    }
    private void actualizarCorreosInstitucionales(UsuarioRepository usuarioRepository) {
        String anterior = "u" + "ta.edu.pe";
        moverCorreo(usuarioRepository, "admin@" + anterior, "admin@universidad.edu.pe");
        moverCorreo(usuarioRepository, "docente@" + anterior, "docente@universidad.edu.pe");
        moverCorreo(usuarioRepository, "mate@" + anterior, "mate@universidad.edu.pe");
        moverCorreo(usuarioRepository, "fisica@" + anterior, "fisica@universidad.edu.pe");
        moverCorreo(usuarioRepository, "estudiante@" + anterior, "estudiante@universidad.edu.pe");
    }

    private void moverCorreo(UsuarioRepository usuarioRepository, String correoAnterior, String correoNuevo) {
        if (usuarioRepository.findByCorreo(correoNuevo).isPresent()) return;
        usuarioRepository.findByCorreo(correoAnterior).ifPresent(usuario -> {
            usuario.correo = correoNuevo;
            usuarioRepository.save(usuario);
        });
    }

    private void asignarPreguntas(Evaluacion e) {
        String nombre = e.curso == null || e.curso.nombre == null ? "" : e.curso.nombre.toLowerCase();
        if (nombre.contains("calculo")) {
            e.preguntasJson = "[{\"texto\":\"La integral definida permite calcular areas bajo una curva en un intervalo.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"},{\"texto\":\"La regla de sustitucion se usa para simplificar integrales mediante un cambio de variable.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"},{\"texto\":\"La derivada de una funcion siempre es igual a su integral indefinida.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Falso\"}]";
        } else if (nombre.contains("fisica")) {
            e.preguntasJson = "[{\"texto\":\"La aceleracion representa el cambio de velocidad respecto al tiempo.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"},{\"texto\":\"La fuerza neta se relaciona con masa y aceleracion segun la segunda ley de Newton.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"},{\"texto\":\"Un cuerpo sin fuerza neta necesariamente esta acelerando.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Falso\"}]";
        } else {
            e.preguntasJson = "[{\"texto\":\"Spring Boot se usa principalmente para crear el backend de una aplicacion web.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"},{\"texto\":\"JPA permite mapear clases Java con tablas de base de datos.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Verdadero\"},{\"texto\":\"React se ejecuta dentro de PostgreSQL.\",\"opciones\":[\"Verdadero\",\"Falso\"],\"correcta\":\"Falso\"}]";
        }
    }

}
