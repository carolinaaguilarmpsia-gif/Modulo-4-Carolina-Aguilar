# Plan — D. Transiciones de estado de DJ (entre roles)

**Seed:** `e2e/seed.spec.ts`
**Explorado en vivo:** DOCENTE crea + envía (BORRADOR → EN_REVISION_FACULTAD) y ADMIN_FACULTAD
aprueba (→ APROBADA) sobre una DJ propia del test — confirmado contra el backend real.

Cada caso crea **su propia DJ** vía la API (arrange, antes del primer `page.goto`) para no
depender de datos sembrados compartidos (`InMemoryDeclaracionJuradaRepository` vive en memoria
durante toda la vida del proceso — si dos tests tocaran la misma DJ semilla, se pisarían entre sí).

## 4.1 Docente envía su DJ a Facultad
**Pasos:**
1. (Arrange vía API) crear una DJ nueva como docente, en BORRADOR.
2. Login UI como el mismo docente → abrir el detalle de esa DJ.
3. Click en "Enviar a Facultad".

**Resultado esperado:** el badge pasa a "En revisión — Facultad"; la tabla de historial gana una fila `Borrador → En revisión — Facultad`.

## 4.2 Admin. Facultad aprueba
**Pasos:**
1. (Arrange vía API) crear una DJ y transicionarla a EN_REVISION_FACULTAD, misma facultad que el admin.
2. Login UI como `admin.facultad@universidad.edu.bo` → abrir el detalle.
3. Click en "Aprobar".

**Resultado esperado:** badge "Aprobada"; el panel de acciones muestra "Trámite cerrado" (ya no hay botones de acción).

## 4.3 Admin. Facultad devuelve — el botón exige observaciones
**Pasos:**
1. (Arrange vía API) DJ en EN_REVISION_FACULTAD, misma facultad.
2. Login UI como admin.facultad → detalle → click en "Devolver con observaciones".
3. Sin escribir nada, verificar el botón "Confirmar".
4. Escribir menos de 10 caracteres, verificar que sigue deshabilitado.
5. Completar 10+ caracteres y click en "Confirmar".

**Resultado esperado:** el botón está deshabilitado en los pasos 3 y 4; tras el paso 5 el badge pasa a "Devuelta".

## 4.4 Docente con vinculación inactiva no puede crear
**Pasos:**
1. Login UI como `carlos.paz@universidad.edu.bo` (vinculación inactiva).
2. Ir a "Nueva declaración", completar el formulario válido y enviar.

**Resultado esperado:** aparece el aviso "Vinculación inactiva" (RB-01); no hay redirección ni mensaje de éxito.

## 4.5 (propuesto y descartado) "Un Admin. Facultad puede aprobar una DJ de otra facultad"
Este caso proponía verificar que SÍ se puede — es lo opuesto de la regla real (RB "misma
facultad" / `CROSS_FACULTY_FORBIDDEN`, ver `DJStateMachine.ts`). Se descarta tal cual está
redactado porque describe un comportamiento que NO debe existir; si se quisiera cubrir ese guard,
el caso correcto sería "un Admin. Facultad NO puede aprobar una DJ de otra facultad" — se deja
anotado como mejora futura, no se generó un test para esta ronda por acotar el alcance a los 4
casos ya verificados en vivo.

---

## Auditoría

| # | Caso propuesto | Decisión | Motivo |
|---|---|---|---|
| 4.1 | Docente envía a Facultad | **Aceptado** | Cubre D1. Confirmado en vivo. |
| 4.2 | Admin aprueba | **Aceptado** | Cubre D2. Confirmado en vivo. |
| 4.3 | Devolver exige observaciones | **Aceptado** | Cubre D3. Verifica un guard de UI real (`disabled` del botón). |
| 4.4 | Vinculación inactiva | **Aceptado** | Cubre D4. Confirmado en vivo. |
| 4.5 | Admin aprueba de otra facultad (mal redactado) | **Descartado** | Describía el comportamiento incorrecto (permitir cross-facultad); anotado como caso futuro con la redacción correcta (negativo), no generado ahora. |

**4 aceptados, 0 corregidos, 1 descartado.**
