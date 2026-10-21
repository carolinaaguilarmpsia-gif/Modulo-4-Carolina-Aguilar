# Roles / etiquetas / data-testid agregados al producto

Encontrados auditando los tests contra la pregunta 1 (localizador de persona) y la pregunta 4
(pequeño e independiente) — cada uno resuelve una ambigüedad real, confirmada explorando la app en
vivo, no una precaución especulativa.

| Archivo | Qué se agregó | Por qué |
|---|---|---|
| `DJStateBadge.tsx` | `data-testid="dj-estado-badge"` + `data-estado={estado}` | El texto del badge ("En revisión — Facultad") se repite tal cual dentro de la tabla de historial de la misma página → `getByText` sería ambiguo (match múltiple, modo estricto de Playwright falla). El atributo `data-estado` además evita acoplar el assert a la traducción del label. |
| `ListaDeclaracionesJuradasPage.tsx` | `data-testid="dj-row-<id>"` en cada `<tr>` | La tabla no muestra el id de la DJ en ningún texto visible, y el backend es in-memory (vive toda la corrida del proceso) — la bandeja de un rol puede tener varias DJ con el mismo período/tipo/estado (semilla + las que va creando cada test). Sin esto, un test solo podía hacer `.first()` sobre "Ver detalle", que es frágil entre corridas. Con el testid, cada test ubica EXACTAMENTE la DJ que él mismo creó. |
| `AsistenteTramitesChat.tsx` y `AsistenteDJPage.tsx` | `data-testid="chat-message"` + `data-role="user"\|"assistant"` en cada burbuja | No había forma de aislar "la última respuesta del asistente" sin depender del texto (que varía si es LLM). Con el testid + `data-role` un test verifica "apareció una burbuja nueva de `assistant`" sin tocar su contenido. |
| `AsistenteDJPage.tsx` | `data-testid="confirmacion-pendiente"` en la tarjeta de confirmación | Sin esto, los botones "Confirmar"/"Cancelar" de la tarjeta no tenían un contenedor estable para scoping — y ese mismo texto de botón también existe en `DJActionPanel.tsx` (el flujo de "Devolver con observaciones"), en otra pantalla pero mismo vocabulario. |
| `AsistenteDJPage.tsx` | `data-testid="traza-panel"` en el `<details>` de la traza | Preparado para auditar la traza del agente (qué herramienta se llamó) sin depender del texto libre del `pensamiento`/`observación`, que sí puede variar por LLM. |

Ningún cambio afecta el comportamiento visible de la UI — son solo atributos adicionales.
