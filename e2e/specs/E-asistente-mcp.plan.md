# Plan — E. Asistente MCP (agente sobre DJ)

**Seed:** `e2e/seed.spec.ts`
**Nota de alcance:** esta pantalla llama a un LLM real (Groq, vía `GroqAgentClient`) para decidir
qué herramienta MCP invocar — a diferencia de B (que tiene un camino 100% determinístico por
keyword), acá **no hay camino que evite el modelo**. Los casos se diseñan para no depender de la
redacción exacta del modelo (pregunta 3): se verifica que aparece una respuesta nueva y el estado
estructural del chat (tarjeta de confirmación presente/ausente), nunca el texto que redacta el LLM.

## 5.1 Pregunta de solo lectura
**Pasos:**
1. Login como `admin.facultad@universidad.edu.bo` → ir a "Asistente MCP".
2. Escribir una pregunta de solo lectura (p. ej. "¿qué reglas de transición hay desde BORRADOR?").
3. Click en "Enviar".

**Resultado esperado:** aparece una burbuja de respuesta nueva del asistente (rol `assistant`); no hay tarjeta "Confirmación requerida".

## 5.2 Pedido de escritura → pausa por confirmación
**Pasos:**
1. (Arrange vía API) crear + enviar una DJ propia a EN_REVISION_FACULTAD.
2. Login como admin.facultad → "Asistente MCP".
3. Pedir aprobar esa DJ puntual por su id.

**Resultado esperado:** aparece la tarjeta "Confirmación requerida" con los botones "Confirmar"/"Cancelar"; la DJ (verificable por API o en otra pestaña) sigue en EN_REVISION_FACULTAD — el agente todavía no ejecutó nada.

## 5.3 Confirmar la acción propuesta
**Pasos:**
1. Continuar desde 5.2.
2. Click en "Confirmar" dentro de la tarjeta.

**Resultado esperado:** la tarjeta de confirmación desaparece del mensaje; aparece una respuesta nueva del asistente.

## 5.4 Cancelar la acción propuesta
**Pasos:**
1. (Arrange) igual que 5.2, con otra DJ propia.
2. Click en "Cancelar" dentro de la tarjeta.

**Resultado esperado:** la tarjeta desaparece; la DJ sigue en EN_REVISION_FACULTAD (no se ejecutó el cambio).

## 5.5 (propuesto y descartado) "El asistente siempre responde en menos de 3 segundos"
Se descarta: es una aserción de rendimiento con un umbral arbitrario contra un LLM real (Groq)
— no es parte del contrato funcional de la interfaz, y un test así sería flaky por naturaleza de
red/modelo, no por un bug del producto.

## 5.6 (propuesto y corregido) "La respuesta debe decir la frase exacta 'DJ aprobada correctamente'"
Corregido a: verificar que aparece una respuesta nueva del asistente (rol `assistant`, burbuja
adicional) y que la traza (`Ver traza`) incluye el paso con la herramienta de escritura — sin
fijar el texto exacto, que lo redacta el LLM caso a caso.

---

## Auditoría

| # | Caso propuesto | Decisión | Motivo |
|---|---|---|---|
| 5.1 | Pregunta de solo lectura | **Aceptado** | Cubre E1. |
| 5.2 | Pausa por confirmación | **Aceptado** | Cubre E2 — guardrail de negocio real (nunca escribe sin confirmar). |
| 5.3 | Confirmar | **Aceptado** | Cubre E3. |
| 5.4 | Cancelar | **Aceptado** | Cubre E4. |
| 5.5 | Latencia < 3s | **Descartado** | Umbral arbitrario contra red/modelo real — no es un contrato de la interfaz. |
| 5.6 | Texto exacto de la respuesta | **Corregido** | Se cambió a verificar estructura (nueva burbuja + traza con la herramienta), no la redacción del LLM. |

**4 aceptados, 1 corregido (aplicado dentro de 5.3), 1 descartado.**

**Riesgo conocido de esta sección:** 5.1–5.4 dependen de que `GROQ_API_KEY` esté configurado y de
la disponibilidad de la red — a diferencia de las demás secciones, acá SÍ hay modelo y red
encendidos. Si el proveedor está caído, estos 4 tests fallan por causa externa, no por un bug de
SGAI; se documenta al correr la suite completa.

**Actualización — key renovada:** con `GROQ_API_KEY` vigente, 5.2–5.4 pasaron de "omitidos" a
correr de verdad. Apareció un segundo tipo de variabilidad, distinto a la disponibilidad del
proveedor: con la MISMA pregunta, el modelo a veces responde en texto libre pidiendo confirmación
("¿Deseás proceder? Respondé 'sí'") en vez de invocar la herramienta de escritura — el guardrail de
"pausa y confirma" del backend solo se activa cuando el modelo hace el tool-call real, no cuando
pregunta por chat. Se mitigó con un prompt más directivo (que reproduce el patrón "proponé la
transición" del propio system prompt del agente) y `retries: 2` en el describe de esta sección —
sigue siendo, honestamente, un test contra un modelo real: la mayoría de las corridas dan las 4
en verde a la primera, alguna necesita un reintento. Eso no se puede eliminar sin dejar de probar
el agente real — se documenta en vez de esconderlo.
