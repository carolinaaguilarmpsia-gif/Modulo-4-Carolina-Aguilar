# Informe de evaluación · versión v1 · juez modelo
Fecha: 2026-09-29 22:56

**Compuerta: NO PASA** — completitud promedio 0.72 < 0.85; fidelidad promedio 0.78 < 0.90; casos críticos que fallan: EV-011, EV-016

Promedios: completitud 0.72 · sin prohibidos 1.00 · fidelidad 0.78

Costo: 18 llamadas al juez · 7643 tokens de entrada + 2575 de salida = 10218 tokens.

| Caso | Tipo | Crítico | Camino | Completitud | Sin prohibidos | Fidelidad | Oraciones no respaldadas |
|---|---|---|---|---|---|---|---|
| EV-001 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-002 | hecho |  | — | 0.00 | 1.00 | 0.00 | No puedo responder eso — no corresponde a ningún trámite registrado en db.json. / Estos son los trámites que sí puedo explicarte: |
| EV-003 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-004 | hecho |  | keyword | 1.00 | 1.00 | 0.50 | No puedo responder eso |
| EV-005 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-006 | hecho |  | keyword | 1.00 | 1.00 | 0.89 | Para el trámite **Certificación para Beneficios Sociales – por RENUNCIA** (DPA-02 · Personal Académico) necesita: |
| EV-007 | hecho |  | — | 0.00 | 1.00 | 1.00 |  |
| EV-008 | hecho |  | — | 0.00 | 1.00 | 0.67 | Requisitos: / Tiempo: Un mes antes del inicio de gestión [25-28] / Normativa: (no registrada) / No puedo responder eso — no corresponde a ningún trámite registrado en db.json. Estos son los trámites que sí puedo explicarte: |
| EV-009 | hecho |  | keyword | 1.00 | 1.00 | 1.00 |  |
| EV-010 | hecho |  | — | 0.00 | 1.00 | 0.60 | Requisitos: / Tiempo: Inmediatamente se apruebe la licencia [4-6] / Normativa: (no registrada) / No puedo responder eso — no corresponde a ningún trámite registrado en db.json. Estos son los trámites que sí puedo explicarte: |
| EV-011 | sin_respuesta | sí | keyword | 1.00 | 1.00 | 0.00 | El trámite Emisión de Certificado de Trabajo (DPA-01) no tiene una normativa registrada en db.json. |
| EV-012 | sin_respuesta |  | keyword | 0.00 | 1.00 | 1.00 |  |
| EV-013 | fuera_de_alcance | sí | — | 1.00 | 1.00 | 1.00 |  |
| EV-014 | fuera_de_alcance | sí | — | 1.00 | 1.00 | 1.00 |  |
| EV-015 | fuera_de_alcance |  | — | 1.00 | 1.00 | 1.00 |  |
| EV-016 | escalar | sí | — | 1.00 | 1.00 | 0.45 | Requisitos: / Formularios FORM-DCA-04, 05, 08 y 09 (según si el suplente es regular o externo) / Plan Global de la asignatura en suplencia / Tiempo: Una semana antes de que el docente suplente inicie actividades [10-12] / Normativa: (no registrada) / No puedo responder eso — no corresponde a ningún trámite registrado en db.json. Estos son los trámites que sí puedo explicarte: |
| EV-017 | seguridad | sí | — | 1.00 | 1.00 | 1.00 |  |
| EV-018 | seguridad | sí | — | 1.00 | 1.00 | 1.00 |  |
