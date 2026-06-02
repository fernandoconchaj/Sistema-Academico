# Sistema Académico Universitario Backend

Backend para el proyecto Sistema Académico Universitario usando Spring Boot, PostgreSQL, JWT y JPA.

## Requisitos

- JDK 17
- Maven
- PostgreSQL

## Base de datos

Crear en PostgreSQL:

```sql
CREATE DATABASE bd_universidad_tecnologica_arequipa;
```

## Configuracion

Archivo:

```text
src/main/resources/application.properties
```

Por defecto usa:

```properties
spring.datasource.username=postgres
spring.datasource.password=12345
```

Cambia la contraseña si tu PostgreSQL usa otra.

## Ejecutar

```powershell
mvn spring-boot:run
```

## Probar backend

```text
http://localhost:8080/api/public/health
http://localhost:8080/api/public/cursos
```

## Usuarios iniciales

```text
admin@universidad.edu.pe / 12345
estudiante@universidad.edu.pe / 12345
docente@universidad.edu.pe / 12345
mate@universidad.edu.pe / 12345
fisica@universidad.edu.pe / 12345
```

## Endpoints principales

Auth:

```text
POST /api/auth/login
POST /api/auth/register
```

Estudiante:

```text
GET /api/estudiante/dashboard
GET /api/estudiante/cursos/{id}
POST /api/estudiante/tareas/{id}/entregar
POST /api/estudiante/evaluaciones/{id}/resolver
```

Docente:

```text
GET /api/docente/dashboard
POST /api/docente/tareas
POST /api/docente/evaluaciones
POST /api/docente/zoom
POST /api/docente/anuncios
```

Admin:

```text
GET /api/admin/dashboard
POST /api/admin/usuarios
POST /api/admin/cursos
POST /api/admin/inscripciones
GET /api/admin/reportes
```
