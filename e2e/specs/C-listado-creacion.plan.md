# Plan — C. Declaraciones juradas: listado y creación (rol DOCENTE)

**Seed:** `e2e/seed.spec.ts`
**Explorado en vivo:** creación real con `docente@universidad.edu.bo` (sin DJ previas) — confirmado
que redirige al detalle en BORRADOR con el código de referencia autogenerado.

## 3.1 Listado vacío
**Pasos:**
1. Login como `docente@universidad.edu.bo` (sin DJ registradas).

**Resultado esperado:** ve "Sin declaraciones" y el link "Nueva declaración".

## 3.2 Crear DJ con datos válidos
**Pasos:**
1. Login como docente.
2. Click en "Nueva declaración".
3. Completar "Cargo institucional" y "Descripción de actividades" (≥ 20 caracteres).
4. Click en "Guardar como borrador".

**Resultado esperado:** aparece el alert de éxito "Declaración jurada creada correctamente" y, tras la redirección, el detalle muestra el badge "Borrador".

## 3.3 Descripción de actividades demasiado corta
**Pasos:**
1. Login como docente → "Nueva declaración".
2. Completar "Cargo institucional" y una "Descripción de actividades" de menos de 20 caracteres.
3. Click en "Guardar como borrador".

**Resultado esperado:** aparece el error de campo bajo "Descripción de actividades"; la URL sigue en `/declaraciones-juradas/nueva` (no navegó).

## 3.4 (propuesto y corregido) "El código de referencia generado debe ser exactamente EXP-LAB-2026-I-XXXX"
Propuesto originalmente como comparación exacta con un código fijo — pero al leer
`generarCodigoReferencia` (createDjSchema.ts:97) el sufijo sale de `Math.random()`, es decir que
NO es determinístico (la corrida en vivo dio `EXP-LAB-2026-I-4453`, pero ese número cambia en cada
carga del formulario). Corregido a verificar el **patrón** (`/^EXP-[A-Z]{3}-\d{4}-(I|II)-\d{4}$/`)
en vez de un valor exacto — de lo contrario el test sería flaky por diseño, no por un bug real.

## 3.5 (propuesto y descartado) "El listado se actualiza solo cada 5 segundos con polling"
No existe tal polling en el código (`ListaDeclaracionesJuradasPage` solo carga una vez al montar).
Se descarta por no corresponder a ninguna funcionalidad real del producto.

---

## Auditoría

| # | Caso propuesto | Decisión | Motivo |
|---|---|---|---|
| 3.1 | Listado vacío | **Aceptado** | Cubre C1. |
| 3.2 | Crear DJ válida | **Aceptado** | Cubre C2, ruta feliz completa. |
| 3.3 | Validación de campo | **Aceptado** | Cubre C3. |
| 3.4 | Código de referencia exacto | **Corregido** | Cambiado a verificación de patrón — el sufijo es no determinístico, confirmado explorando en vivo. |
| 3.5 | Polling cada 5s | **Descartado** | No existe esa funcionalidad en el código. |

**3 aceptados, 1 corregido, 1 descartado.** (C4 — ver detalle — se cubre dentro de 3.2 al verificar el detalle post-creación; no se generó un caso aparte para no duplicar.)
