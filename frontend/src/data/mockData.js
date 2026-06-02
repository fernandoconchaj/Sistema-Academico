export const users = [
  { id: 1, nombres: 'Administrador', apellidos: 'Sistema', correo: 'admin@universidad.edu.pe', password: '12345', rol: 'ADMIN', estado: 'Activo' },
  { id: 2, nombres: 'Carlos', apellidos: 'Ramirez', correo: 'docente@universidad.edu.pe', password: '12345', rol: 'DOCENTE', estado: 'Activo', especialidad: 'Ingenieria de Software' },
  { id: 3, nombres: 'Fernando', apellidos: 'Mamani', correo: 'estudiante@universidad.edu.pe', password: '12345', rol: 'ESTUDIANTE', estado: 'Activo', carrera: 'Ingenieria de Sistemas' }
]

export const courses = [
  {
    id: 1,
    codigo: 'IS-601',
    nombre: 'Marcos de Desarrollo Web',
    categoria: 'Desarrollo Web',
    docente: 'Carlos Ramirez',
    modalidad: 'Virtual 24/7',
    ciclo: '2026-1',
    creditos: 4,
    progreso: 68,
    color: 'from-blue-600 to-indigo-700',
    descripcion: 'Curso orientado al desarrollo web moderno usando React, Spring Boot y bases de datos relacionales.',
    semanas: [
      { id: 101, titulo: 'Semana 01 - Introduccion a frameworks web', tipo: 'Material PDF', estado: 'Revisado', contenido: 'Conceptos base de framework web, arquitectura cliente-servidor, frontend y backend.' },
      { id: 102, titulo: 'Semana 02 - React y componentes', tipo: 'Clase grabada', estado: 'Pendiente', contenido: 'Componentes, props, estado, eventos y estructura de un proyecto React.' },
      { id: 103, titulo: 'Semana 03 - APIs REST con Spring Boot', tipo: 'Laboratorio', estado: 'Nuevo', contenido: 'Controladores REST, endpoints, servicios y conexión con frontend.' }
    ]
  },
  {
    id: 2,
    codigo: 'MAT-401',
    nombre: 'Calculo Integral',
    categoria: 'Matematica',
    docente: 'Rosa Delgado',
    modalidad: 'Presencial',
    ciclo: '2026-1',
    creditos: 5,
    progreso: 42,
    color: 'from-emerald-500 to-teal-700',
    descripcion: 'Fundamentos de integrales, aplicaciones y solucion de problemas matematicos.',
    semanas: [
      { id: 201, titulo: 'Semana 01 - Antiderivadas', tipo: 'Material PDF', estado: 'Revisado', contenido: 'Reglas basicas de integracion y antiderivadas inmediatas.' },
      { id: 202, titulo: 'Semana 02 - Integral definida', tipo: 'Practica', estado: 'Pendiente', contenido: 'Area bajo la curva, propiedades y aplicaciones de la integral definida.' },
      { id: 203, titulo: 'Semana 03 - Tecnicas de integracion', tipo: 'Video', estado: 'Nuevo', contenido: 'Sustitucion, integracion por partes y fracciones parciales.' }
    ]
  },
  {
    id: 3,
    codigo: 'FIS-301',
    nombre: 'Fisica I',
    categoria: 'Ciencias',
    docente: 'Miguel Torres',
    modalidad: 'Virtual',
    ciclo: '2026-1',
    creditos: 4,
    progreso: 55,
    color: 'from-orange-500 to-rose-600',
    descripcion: 'Mecanica, movimiento, fuerzas y energia aplicada a problemas de ingenieria.',
    semanas: [
      { id: 301, titulo: 'Semana 01 - Movimiento rectilineo', tipo: 'Video', estado: 'Revisado', contenido: 'MRU, MRUV, velocidad, aceleracion y graficas cinematicas.' },
      { id: 302, titulo: 'Semana 02 - Leyes de Newton', tipo: 'Evaluacion corta', estado: 'Nuevo', contenido: 'Fuerzas, masa, aceleracion, equilibrio y dinamica.' },
      { id: 303, titulo: 'Semana 03 - Trabajo y energia', tipo: 'Material PDF', estado: 'Pendiente', contenido: 'Energia cinetica, potencial y conservacion de energia.' }
    ]
  },
  {
    id: 4,
    codigo: 'IS-701',
    nombre: 'Seguridad Informatica',
    categoria: 'Ciberseguridad',
    docente: 'Lucia Herrera',
    modalidad: 'Virtual 24/7',
    ciclo: '2026-1',
    creditos: 4,
    progreso: 33,
    color: 'from-violet-600 to-fuchsia-700',
    descripcion: 'Fundamentos de seguridad, amenazas, controles y buenas practicas en aplicaciones web.',
    semanas: [
      { id: 401, titulo: 'Semana 01 - Principios de seguridad', tipo: 'Material PDF', estado: 'Pendiente', contenido: 'Confidencialidad, integridad, disponibilidad, riesgos y controles.' },
      { id: 402, titulo: 'Semana 02 - Amenazas web', tipo: 'Laboratorio', estado: 'Nuevo', contenido: 'Phishing, malware, inyeccion SQL y buenas practicas.' },
      { id: 403, titulo: 'Semana 03 - Autenticacion segura', tipo: 'Clase grabada', estado: 'Pendiente', contenido: 'Contraseñas, JWT, roles y seguridad de sesiones.' }
    ]
  }
]

export const tasks = [
  { id: 1, cursoId: 1, titulo: 'Laboratorio React + Tailwind', fecha: '2026-06-15', estado: 'Por entregar', puntaje: 20, indicacion: 'Sube una captura y explica los componentes creados.' },
  { id: 2, cursoId: 2, titulo: 'Practica de integrales', fecha: '2026-06-12', estado: 'Entregada', puntaje: 18, indicacion: 'Resolver 10 ejercicios de integrales definidas.' },
  { id: 3, cursoId: 3, titulo: 'Informe Leyes de Newton', fecha: '2026-06-18', estado: 'Por entregar', puntaje: 20, indicacion: 'Realizar un informe breve con ejemplos aplicados.' },
  { id: 4, cursoId: 4, titulo: 'Analisis de riesgos en una web', fecha: '2026-06-22', estado: 'Por entregar', puntaje: 20, indicacion: 'Identifica 5 riesgos y propone controles.' }
]

export const evaluations = [
  { id: 1, cursoId: 1, titulo: 'Evaluacion Parcial - Spring Boot', fecha: '2026-06-20', duracion: '60 min', intentos: 1, estado: 'Disponible', preguntas: [
    { enunciado: '¿Que anotacion se usa para marcar una clase como controlador en Spring MVC?', opciones: ['@Service', '@Controller', '@Repository', '@Entity'], correcta: '@Controller' },
    { enunciado: '¿Que herramienta se usa para crear estilos utilitarios en este frontend?', opciones: ['Hibernate', 'Tailwind CSS', 'la base de datos', 'Maven'], correcta: 'Tailwind CSS' },
    { enunciado: '¿Que patron separa Modelo, Vista y Controlador?', opciones: ['MVC', 'DAO', 'Factory', 'Singleton'], correcta: 'MVC' }
  ] },
  { id: 2, cursoId: 2, titulo: 'Practica Calificada - Integrales', fecha: '2026-06-21', duracion: '45 min', intentos: 2, estado: 'Disponible', preguntas: [
    { enunciado: 'La integral indefinida representa:', opciones: ['Una familia de funciones', 'Solo un numero', 'Una matriz', 'Una derivada segunda'], correcta: 'Una familia de funciones' },
    { enunciado: 'La integral definida puede interpretarse como:', opciones: ['Area bajo la curva', 'Raiz cuadrada', 'Producto punto', 'Una clase Java'], correcta: 'Area bajo la curva' }
  ] },
  { id: 3, cursoId: 3, titulo: 'Practica Calificada 1 - Dinamica', fecha: '2026-06-21', duracion: '45 min', intentos: 2, estado: 'Disponible', preguntas: [
    { enunciado: 'Segun la segunda ley de Newton, la fuerza es:', opciones: ['F=m*a', 'E=m*c', 'V=I*R', 'P=m*g*h'], correcta: 'F=m*a' },
    { enunciado: 'La unidad de fuerza en el SI es:', opciones: ['Newton', 'Joule', 'Watt', 'Pascal'], correcta: 'Newton' }
  ] },
  { id: 4, cursoId: 4, titulo: 'Evaluacion - Fundamentos de seguridad', fecha: '2026-06-23', duracion: '40 min', intentos: 1, estado: 'Disponible', preguntas: [
    { enunciado: 'La triada CIA significa:', opciones: ['Confidencialidad, Integridad y Disponibilidad', 'Control, Internet y Acceso', 'Codigo, Interfaz y API', 'Cliente, Ingreso y Archivo'], correcta: 'Confidencialidad, Integridad y Disponibilidad' },
    { enunciado: 'Un ejemplo de autenticacion es:', opciones: ['Usuario y contraseña', 'Cambiar el color de una web', 'Crear una tabla sin clave', 'Compilar CSS'], correcta: 'Usuario y contraseña' }
  ] }
]

export const zoomClasses = [
  { id: 1, cursoId: 1, titulo: 'Clase 04 - Consumo de APIs', fecha: '2026-06-10', hora: '19:00', enlace: 'https://zoom.us/j/123456789', grabacion: 'https://zoom.us/rec/share/demo-web' },
  { id: 2, cursoId: 2, titulo: 'Clase 03 - Integracion por partes', fecha: '2026-06-11', hora: '18:00', enlace: 'https://zoom.us/j/987654321', grabacion: 'https://zoom.us/rec/share/demo-calculo' },
  { id: 3, cursoId: 3, titulo: 'Clase 05 - Leyes de Newton', fecha: '2026-06-12', hora: '20:00', enlace: 'https://zoom.us/j/555444333', grabacion: 'https://zoom.us/rec/share/demo-fisica' },
  { id: 4, cursoId: 4, titulo: 'Clase 02 - Seguridad en aplicaciones', fecha: '2026-06-13', hora: '19:30', enlace: 'https://zoom.us/j/222333444', grabacion: 'https://zoom.us/rec/share/demo-seguridad' }
]

export const announcements = [
  { id: 1, cursoId: 1, titulo: 'Recordatorio de laboratorio', mensaje: 'No olvidar subir avance del proyecto en GitHub.', fecha: '2026-06-08' },
  { id: 2, cursoId: 2, titulo: 'Practica adicional disponible', mensaje: 'Se habilito una nueva guia de integrales para reforzar la semana 02.', fecha: '2026-06-09' },
  { id: 3, cursoId: 3, titulo: 'Material nuevo disponible', mensaje: 'Se subio la guia de ejercicios de dinamica.', fecha: '2026-06-09' },
  { id: 4, cursoId: 4, titulo: 'Lectura obligatoria', mensaje: 'Revisar el material sobre autenticacion segura antes de la evaluacion.', fecha: '2026-06-10' }
]

export const enrollments = [
  { id: 1, estudiante: 'Fernando Mamani', curso: 'Marcos de Desarrollo Web', estado: 'Matriculado' },
  { id: 2, estudiante: 'Fernando Mamani', curso: 'Calculo Integral', estado: 'Matriculado' },
  { id: 3, estudiante: 'Fernando Mamani', curso: 'Fisica I', estado: 'Matriculado' }
]

export const categories = ['Desarrollo Web', 'Matematica', 'Ciencias', 'Ciberseguridad', 'Inteligencia Artificial', 'Gestion']


export const teacherSchedule = [
  { id: 1, dia: 'Lunes', horaInicio: '08:00', horaFin: '10:00', cursoId: 1, curso: 'Marcos de Desarrollo Web', salon: 'Laboratorio B-204', modalidad: 'Presencial', sede: 'Campus Arequipa' },
  { id: 2, dia: 'Martes', horaInicio: '10:00', horaFin: '12:00', cursoId: 2, curso: 'Calculo Integral', salon: 'Aula A-302', modalidad: 'Presencial', sede: 'Campus Arequipa' },
  { id: 3, dia: 'Miercoles', horaInicio: '19:00', horaFin: '21:00', cursoId: 1, curso: 'Marcos de Desarrollo Web', salon: 'Zoom / Aula virtual', modalidad: 'Virtual 24/7', sede: 'Virtual' },
  { id: 4, dia: 'Jueves', horaInicio: '13:00', horaFin: '15:00', cursoId: 3, curso: 'Fisica I', salon: 'Laboratorio F-101', modalidad: 'Presencial', sede: 'Campus Arequipa' },
  { id: 5, dia: 'Sabado', horaInicio: '09:00', horaFin: '12:00', cursoId: 1, curso: 'Marcos de Desarrollo Web', salon: 'Laboratorio B-204', modalidad: 'Presencial', sede: 'Campus Arequipa' }
]

export const teacherNotifications = [
  { id: 1, tipo: 'Tarea', titulo: 'Nueva entrega recibida', mensaje: 'Fernando Mamani entrego Laboratorio React + Tailwind.', fecha: 'Hoy, 09:15' },
  { id: 2, tipo: 'Evaluacion', titulo: 'Evaluacion programada', mensaje: 'Evaluacion Parcial - Spring Boot vence el 20/06/2026.', fecha: 'Ayer, 18:40' },
  { id: 3, tipo: 'Zoom', titulo: 'Clase Zoom pendiente', mensaje: 'Clase 04 - Consumo de APIs programada para las 19:00.', fecha: 'Ayer, 12:10' }
]
