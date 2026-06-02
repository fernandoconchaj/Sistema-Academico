# Sistema Académico

Sistema web full stack para la gestión académica de usuarios, cursos, tareas, evaluaciones, reportes, chat académico, clases virtuales y archivos académicos. El proyecto integra un backend desarrollado con Spring Boot y un frontend desarrollado con React, conectado a una base de datos PostgreSQL.

## Descripción general

Sistema Académico es una plataforma orientada a instituciones educativas. Permite centralizar la administración académica en un solo entorno, separando funcionalidades según el rol del usuario: administrador, docente y estudiante.

El sistema incluye autenticación con JWT, control de roles, gestión de usuarios, gestión de cursos, paneles por rol, entrega de tareas, evaluaciones, reportes, chat académico y vista previa de archivos PDF.

## Tecnologías utilizadas

### Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA
* JWT
* PostgreSQL
* Apache POI
* Apache Commons
* Google Guava
* Logback
* Maven

### Frontend

* React
* Vite
* JavaScript
* Tailwind CSS
* Axios
* React Router

## Funcionalidades principales

* Inicio de sesión con autenticación JWT.
* Control de acceso por roles.
* Panel administrador.
* Gestión de usuarios.
* Activación y desactivación de cuentas.
* Bloqueo de acceso para usuarios inactivos.
* Gestión de cursos y matrículas.
* Panel docente para tareas, evaluaciones, anuncios y clases virtuales.
* Panel estudiante para cursos, calendario, tareas y evaluaciones.
* Chat académico.
* Vista previa de archivos PDF.
* Descarga de documentos académicos.
* Exportación de reportes en Excel.
* Diseño responsive para escritorio, tablet y celular.

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
```

## Buenas prácticas aplicadas

* Separación entre frontend y backend.
* Comunicación mediante API REST.
* Arquitectura por capas.
* Uso del patrón Repository para acceso a datos.
* Servicios separados por responsabilidad.
* Control de roles y permisos.
* Seguridad con JWT.
* Validación de usuarios activos e inactivos.
* Registro de eventos mediante Logback.
* Exportación de reportes mediante Apache POI.
* Control de versiones con Git y GitHub.

## Seguridad

El sistema implementa autenticación basada en JWT. Cada usuario accede únicamente a las funcionalidades permitidas según su rol dentro de la plataforma.

Además, se valida el estado de la cuenta antes de permitir el inicio de sesión. Si una cuenta se encuentra inactiva, el sistema bloquea el acceso aunque las credenciales sean correctas.

## Ejecución del proyecto

### Requisitos previos

* Java 21
* Maven
* Node.js
* PostgreSQL

### Base de datos

Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE bd_universidad_tecnologica_arequipa;
```

La configuración de conexión se encuentra en:

```text
backend/src/main/resources/application.properties
```

### Ejecutar backend

```bash
cd backend
mvn spring-boot:run
```

El backend se ejecuta en:

```text
http://localhost:8080
```

### Ejecutar frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se ejecuta en:

```text
http://localhost:5173
```

## Usuarios de prueba

```text
Administrador: admin@universidad.edu.pe / 12345
Docente: docente@universidad.edu.pe / 12345
Estudiante: estudiante@universidad.edu.pe / 12345
```

## Estado del proyecto

Proyecto full stack funcional en entorno local, desarrollado con frontend, backend, base de datos, autenticación, roles, reportes, carga de archivos y control de versiones.

## Autor

Fernando Concha Jimenez
Estudiante de Ingeniería de Sistemas e Informática.
