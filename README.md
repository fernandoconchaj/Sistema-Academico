# Sistema Academico

Sistema web full stack para la gestion academica de usuarios, cursos, tareas, evaluaciones, reportes, chat academico, clases virtuales y archivos academicos. El proyecto integra un backend desarrollado con Spring Boot y un frontend desarrollado con React, conectado a una base de datos PostgreSQL.

## Descripcion general

Sistema Academico es una plataforma orientada a instituciones educativas. Permite centralizar la administracion academica en un solo entorno, separando funcionalidades segun el rol del usuario: administrador, docente y estudiante.

El sistema incluye autenticacion con JWT, control de roles, gestion de usuarios, gestion de cursos, paneles por rol, entrega de tareas, evaluaciones, reportes, chat academico y vista previa de archivos PDF.

## Tecnologias utilizadas

### Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT
- PostgreSQL
- Apache POI
- Apache Commons
- Google Guava
- Logback
- Maven

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Axios
- React Router

## Funcionalidades principales

- Inicio de sesion con autenticacion JWT.
- Control de acceso por roles.
- Panel administrador.
- Gestion de usuarios.
- Activacion y desactivacion de cuentas.
- Bloqueo de acceso para usuarios inactivos.
- Gestion de cursos y matriculas.
- Panel docente para tareas, evaluaciones, anuncios y clases virtuales.
- Panel estudiante para cursos, calendario, tareas y evaluaciones.
- Chat academico.
- Vista previa de archivos PDF.
- Descarga de documentos academicos.
- Exportacion de reportes en Excel.
- Diseno responsive para escritorio, tablet y celular.

## Arquitectura del proyecto

```text
Sistema-Academico
├── backend
│   ├── config
│   ├── controller
│   ├── dto
│   ├── entity
│   ├── repository
│   ├── service
│   └── util
│
└── frontend
    ├── components
    ├── pages
    ├── services
    └── utils