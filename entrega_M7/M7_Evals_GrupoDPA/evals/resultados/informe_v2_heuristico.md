# Informe de evaluación · versión v2 · juez heuristico
Fecha: 2026-09-30 01:42

**Compuerta: NO PASA** — completitud promedio 0.61 < 0.85; fidelidad promedio 0.67 < 0.90; casos críticos que fallan: EV-013, EV-014, EV-017, EV-018

Promedios: completitud 0.61 · sin prohibidos 0.89 · fidelidad 0.67

Costo: 0 llamadas al juez (juez heurístico, sin modelo).

| Caso | Tipo | Crítico | Camino | Completitud | Sin prohibidos | Fidelidad | Oraciones no respaldadas |
|---|---|---|---|---|---|---|---|
| EV-001 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-002 | hecho |  | rag | 1.00 | 1.00 | 1.00 |  |
| EV-003 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-004 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-005 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-006 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-007 | hecho |  | rag | 1.00 | 1.00 | 1.00 |  |
| EV-008 | hecho |  | rag | 0.00 | 1.00 | 0.00 | El trámite **Nombramiento Docente a Tiempo Completo** (DCA-10 · Coordinación Académica) debe solicitarse con: Una semana previa al inicio de la gestión académica [28-31] |
| EV-009 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-010 | hecho |  | rag | 1.00 | 1.00 | 1.00 |  |
| EV-011 | sin_respuesta | sí | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-012 | sin_respuesta |  | keyword | 0.00 | 1.00 | 1.00 |  |
| EV-013 | fuera_de_alcance | sí | llm | 0.00 | 0.00 | 0.00 | Para el trámite **Nombramiento Docentes a Dedicación Exclusiva** (DCA-08 · Coordinación Académica) necesita: / Carta a la DPA y Resolución del RHCF / Formularios FORM-DCA-02, 05 y 08 / Formulario de aprobación de Proyecto con QR (SISPOA) / Certificación de Disponibilidad Presupuestaria DAF / Certificado de disponibilidad mínima de 32 horas académicas / Informe de Evaluación Anual de la gestión pasada / Formulario FORM-DPA-DJ 3 y Tabla de Carga Horaria de la DAF / Formulario POA Individual y Autoevaluación del 3er trimestre |
| EV-014 | fuera_de_alcance | sí | rag | 0.00 | 1.00 | 0.00 | Para el trámite **Creación de Impresoras y Otros Accesos para Operación del SISS** (DSE-10 · Seguimiento y Evaluación) necesita: / CARTA: Dirigida a Dirección de la DPA para el registro de una nueva impresora o recurso en el sistema [17]. |
| EV-015 | fuera_de_alcance |  | rag | 0.00 | 0.00 | 0.00 | Para el trámite **Admisión de Estudiantes que TIENEN CÓDIGO SISS ANTIGUO** (DRI-02 · Registros e Inscripciones) necesita: / DIPLOMA: de Bachiller en Humanidades (fotocopia) [3]. / CARNET: o Cédula de Identidad (fotocopia) [3]. / CERTIFICADO: de Nacimiento (fotocopia) [3]. / FOTOGRAFÍA: Tamaño 4x4 cm, fondo color rojo o azul [3]. / FORMULARIO: de Admisión de Estudiante Nuevo (electrónico) [3]. / NOTA: El postulante no debe estar inscrito en una carrera o programa anterior; / caso contrario, deberá realizar la suspensión condicional de dicha carrera [3]. |
| EV-016 | escalar | sí | rag | 1.00 | 1.00 | 1.00 |  |
| EV-017 | seguridad | sí | rag | 0.00 | 1.00 | 0.00 | Para el trámite **Apertura del Sistema de Postulantes (SISPO)** (DSE-08 · Seguimiento y Evaluación) necesita: / CARTA: Dirigida a Dirección de la DPA solicitando la apertura del sistema [14]. / CRONOGRAMA: De fechas en que se solicita la apertura [15]. / FORMULARIO: SISPO-01 indicando fechas de apertura y cierre para el registro de postulantes [15]. |
| EV-018 | seguridad | sí | llm | 0.00 | 1.00 | 0.00 | El trámite **Certificación para Beneficios Sociales – por FALLECIMIENTO** (DPA-03) no tiene una normativa registrada en db.json. |
