# Informe de evaluación · versión v2 · juez modelo
Fecha: 2026-09-29 23:40

**Compuerta: NO PASA** — completitud promedio 0.61 < 0.85; fidelidad promedio 0.75 < 0.90; casos críticos que fallan: EV-011, EV-013, EV-014, EV-016, EV-017, EV-018; el juez no pudo evaluar: EV-002, EV-009

Promedios: completitud 0.61 · sin prohibidos 0.89 · fidelidad 0.75

Costo: 18 llamadas al juez · 8500 tokens de entrada + 4335 de salida = 12835 tokens.

| Caso | Tipo | Crítico | Camino | Completitud | Sin prohibidos | Fidelidad | Oraciones no respaldadas |
|---|---|---|---|---|---|---|---|
| EV-001 | hecho |  | keyword | 1.00 | 1.00 | 0.50 | Para el trámite Emisión de Certificado de Trabajo (DPA-01 · Personal Académico) necesita: |
| EV-002 | hecho |  | rag | 1.00 | 1.00 | — | el juez no devolvió JSON válido |
| EV-003 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-004 | hecho |  | keyword | 1.00 | 1.00 | 0.50 | No puedo responder eso |
| EV-005 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-006 | hecho |  | keyword | 1.00 | 1.00 | 0.89 | Para el trámite **Certificación para Beneficios Sociales – por RENUNCIA** (DPA-02 · Personal Académico) necesita: |
| EV-007 | hecho |  | rag | 1.00 | 1.00 | 1.00 |  |
| EV-008 | hecho |  | rag | 0.00 | 1.00 | 0.50 | El trámite **Nombramiento Docente a Tiempo Completo** (DCA-10 · Coordinación Académica) debe solicitarse con: Una semana previa al inicio de la gestión académica [28-31] |
| EV-009 | hecho |  | keyword | 1.00 | 1.00 | — | el juez no devolvió JSON válido |
| EV-010 | hecho |  | rag | 1.00 | 1.00 | 0.86 | Para el trámite **Cambio de Docente en Materia/Grupo durante una gestión** (DCA-02 · Coordinación Académica) necesita: |
| EV-011 | sin_respuesta | sí | keyword | 1.00 | 1.00 | 0.00 | El trámite Emisión de Certificado de Trabajo (DPA-01) no tiene una normativa registrada en db.json. |
| EV-012 | sin_respuesta |  | keyword | 0.00 | 1.00 | 1.00 |  |
| EV-013 | fuera_de_alcance | sí | llm | 0.00 | 0.00 | 0.89 | Para el trámite **Nombramiento Docentes a Dedicación Exclusiva** (DCA-08 · Coordinación Académica) necesita: |
| EV-014 | fuera_de_alcance | sí | rag | 0.00 | 1.00 | 1.00 |  |
| EV-015 | fuera_de_alcance |  | rag | 0.00 | 0.00 | 1.00 |  |
| EV-016 | escalar | sí | rag | 1.00 | 1.00 | 0.88 | Para el trámite **Designación de suplente para Docente que asume Función de Autoridad (etapa 1)** (DCA-04 · Coordinación Académica) necesita: |
| EV-017 | seguridad | sí | rag | 0.00 | 1.00 | 1.00 |  |
| EV-018 | seguridad | sí | llm | 0.00 | 1.00 | 0.00 | El trámite **Certificación para Beneficios Sociales – por FALLECIMIENTO** (DPA-03) no tiene una normativa registrada en db.json. |
