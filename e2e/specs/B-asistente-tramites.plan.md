# Plan — B. Asistente de trámites (chat público en /login)

**Seed:** `e2e/seed.spec.ts`
**Explorado en vivo:** panel visible en `/login` con "IA_HABILITADA: activa" contra el backend real.

## 2.1 Pregunta que matchea por keyword
**Pasos:**
1. Ir a `/login`.
2. En "Escriba su pregunta sobre un trámite", escribir "¿Qué requisitos necesito para el certificado de trabajo?".
3. Click en "Enviar".

**Resultado esperado:** aparece una burbuja de respuesta nueva con la etiqueta "Keyword" y una etiqueta "Fuente: db.json → …".

## 2.2 Pregunta fuera de alcance
**Pasos:**
1. Ir a `/login`.
2. Escribir una pregunta que no matchea ningún trámite (p. ej. "¿cuánto gana un docente a dedicación exclusiva?").
3. Click en "Enviar".

**Resultado esperado:** aparece la etiqueta "Fuera de alcance" y la lista de trámites disponibles por departamento.

## 2.3 (propuesto y corregido) "La respuesta del asistente debe decir textualmente los requisitos del certificado de trabajo"
Propuesta original: comparar el texto completo de la respuesta contra un string armado a mano
en el test (una copia del contenido de `db.json`). Corregido a: verificar que la respuesta
**contiene** un requisito real conocido (p. ej. "Carnet de identidad") Y que la etiqueta de
fuente apunta al departamento correcto — ancla en el dato real (`db.json`), no en la redacción
completa que arma el backend, que puede reformatear el texto sin que eso sea un bug real.

## 2.4 (propuesto y descartado) "Reintentar 3 veces si el asistente tarda más de 2 segundos"
Se descarta: es una espera fija disfrazada de reintento (pregunta 2 — sin esperas fijas).
Playwright ya espera automáticamente a que la burbuja de respuesta aparezca vía
`expect(locator).toBeVisible()`; no hace falta ni conviene un retry/timeout manual.

---

## Auditoría

| # | Caso propuesto | Decisión | Motivo |
|---|---|---|---|
| 2.1 | Keyword match | **Aceptado** | Cubre B1. Camino 100% determinístico (nunca llama al LLM), ideal para E2E estable. |
| 2.2 | Fuera de alcance | **Aceptado** | Cubre B2. También determinístico (el guard de "fuera de alcance temático" corta antes del LLM). |
| 2.3 | Texto exacto de respuesta | **Corregido** | Se cambió el assert de igualdad de texto completo a `toContainText` sobre un dato real + verificación de la fuente — ver nota arriba. |
| 2.4 | Retry con timeout de 2s | **Descartado** | Espera fija disfrazada; Playwright ya auto-espera. |

**2 aceptados, 1 corregido, 1 descartado.**
