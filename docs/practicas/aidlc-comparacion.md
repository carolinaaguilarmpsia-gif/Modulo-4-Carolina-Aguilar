# Práctica: AI-DLC de AWS con y sin herramienta

## 1. Datos

- **Modalidad:** individual
- **Rama sin herramienta (A):** `https://github.com/carolinaaguilarmpsia-gif/Modulo-4-Carolina-Aguilar/tree/feature-con-aidlc`
- **Rama con herramienta (B):** `https://github.com/carolinaaguilarmpsia-gif/Modulo-4-Carolina-Aguilar/tree/feature-sin-aidlc`
- **Video (opcional):** no se grabó

**Responsables:**

| Integrante | Qué hizo | Commits o PR |
|---|---|---|
| Carolina Aguilar | Eligió el feature, aprobó cada puerta de la versión B, respondió las preguntas de requisitos, decidió omitir la etapa de despliegue, ejecutó la instalación de AI-DLC y hizo los push | `291d342` (rama A), `f5e1c31` (rama B) |

Ambas versiones se implementaron con un asistente de IA (Claude Code) bajo la dirección de Carolina. La identidad de autor de los commits es la de Carolina.

## 2. El feature

Detalle en [`feature.md`](../../feature.md).

`GET .../estadisticas` devuelve cuántas declaraciones juradas (DJ) hay en cada estado.

- **Entrada:** `?facultadId=` opcional. DOCENTE ve solo las suyas; ADMIN_FACULTAD solo su facultad (RB-05); TECNICO_DPA y ADMIN_SISTEMA ven todas y pueden filtrar.
- **Salida 200:** `{ porEstado: { los 6 estados }, total, correlationId }`, con 0 donde no hay DJ.
- **Errores:** 401 sin token; 403 si un ADMIN_FACULTAD pide una facultad ajena.
- **Criterio de aceptación:** las pruebas pasan, la respuesta incluye los 6 estados y no se filtran datos de otros docentes.

Nota: `feature.md` escribe la ruta como `/api/dj/estadisticas`, pero esa ruta no existe en el proyecto. El router de DJ está montado en `/api/v1/declaraciones-juradas`.

## 3. Versión A: sin la herramienta

- **Cómo trabajaron:** el asistente de IA directamente, con un solo prompt que contenía el texto de `feature.md`. Leyó el controlador, el servicio y el repositorio, implementó el método en el servicio, la acción en el controlador y la ruta, y escribió las pruebas.
- **Resultado:** rama `feature-sin-aidlc`, commit `291d342`.
- **Qué quedó:** 4 archivos de código modificados y 1 archivo de pruebas nuevo (5 pruebas del servicio). No hay prueba HTTP del endpoint.

## 4. Versión B: con AI-DLC de AWS 2.11.0 (perfil Express)

- **Comando usado:** `/aidlc express Implementar el endpoint GET /api/dj/estadisticas descrito en feature.md`
- **Salida de `aidlc version`:** `aidlc 2.11.0 (runtime 2.11.0)`
- **Puertas que revisaron y qué corrigieron con Request Changes:**

| Puerta | Etapa | Resultado |
|---|---|---|
| 1 | Reverse Engineering | Aprobada. Ninguna corrección. |
| 2 | Requirements Analysis | Aprobada. Ninguna corrección. Antes se respondieron 3 preguntas (ruta, código del 403, ADMIN_FACULTAD sin facultad). |
| 3 | Code Generation | Aprobada. Ninguna corrección. |
| 4 | Build and Test | Aprobada. Ninguna corrección. |
| 5 | Deployment Pipeline | Omitida por decisión de Carolina (no hay pipeline de despliegue que crear). |
| 6 | Deployment Execution | Omitida por el asistente, sin consultar: no hay entorno de despliegue. |
| 7 | Observability Setup | Omitida por el asistente, sin consultar: no hay aplicación desplegada. |

No hubo ningún Request Changes en esta práctica.

- **Artefactos versionados:** `aidlc/` (82 archivos, incluidos el estado, la auditoría, `requirements.md`, `code-generation-plan.md` y `test-results.md`) y `.aidlc-version`. El archivo `.aidlc-version` no lo generó la herramienta: lo creó el asistente a mano con el contenido `2.11.0`.

## 5. Comparación

| Aspecto | A · sin herramienta | B · con AI-DLC de AWS |
|---|---|---|
| Tiempo total | Unos 2 minutos de reloj (21:49 a 21:50) | Unos 24 minutos de reloj (18:03 a 18:27), sin contar la instalación ni el arreglo de permisos |
| Veces que tuvieron que intervenir o corregir | 1 corrección del asistente (código de error del 403). Carolina solo confirmó el feature. | 4 aprobaciones de puerta, 1 decisión de omitir, 1 elección del modo de respuesta y 3 respuestas de requisitos. 0 Request Changes. Además hubo trabajo de entorno: permisos de `~/.local`, el PATH y reactivar los hooks. |
| Artefactos que quedaron en el repositorio | `feature.md`, el código y las pruebas | Lo mismo, más `aidlc/` (82 archivos) y `.aidlc-version` |
| ¿Las pruebas pasan? (ejecutadas por ustedes) | Sí: 22 de 22 en el dominio DJ | Sí: suite completa del backend, 20 archivos y 132 pruebas pasan, 2 omitidas que ya estaban así. 14 pruebas nuevas (9 del servicio y 5 HTTP). |
| Qué salió mejor | Muy rápido y con poco ruido. El código resultó casi igual al de B. | Detectó que la ruta de `feature.md` no existía y lo dejó escrito. Cubrió el caso ADMIN_FACULTAD sin facultad. Agregó prueba HTTP. Todo queda con trazabilidad requisito → código → prueba. |
| Qué salió peor | No detectó que la ruta de `feature.md` no coincide con el router real. No cubrió ADMIN_FACULTAD sin facultad. No hay prueba HTTP. Casi no queda registro de por qué se decidió cada cosa. | Mucho más lento y con mucho papeleo para un cambio pequeño. Hubo fricción de instalación. El perfil express igual pasa por etapas de despliegue que no aplican. Las etapas 6 y 7 se omitieron sin preguntar. |

## 6. Conclusiones

1. **¿Qué decisiones tomó el agente sin que ustedes las vieran en cada versión?**
   - En A: contar con `repository.list` y una página enorme en vez de agregar un método al repositorio, y el código de error del 403. Solo se vieron al final.
   - En B: omitir las etapas 6 y 7, escanear solo `backend/` (no el repo completo) al hacer la ingeniería inversa, mantener 100000 como tamaño de página, y crear `.aidlc-version` a mano. Las decisiones de requisitos sí pasaron por preguntas.
2. **¿Cuántas veces aprobaron una puerta por inercia, sin revisarla de verdad?**  Todas las puertas se aprobaron una por una.
3. **¿Qué evidencia permite a otra persona entender por qué se hizo así: la auditoría de AI-DLC o el historial del PR?** En B, `aidlc/` guarda las preguntas con sus respuestas (por ejemplo, por qué la ruta es `/api/v1/...`), los requisitos con IDs y la trazabilidad. En A solo queda el mensaje del commit, que incluso cita la ruta equivocada (`/api/dj/estadisticas`).
4. **¿Para qué tamaño de cambio vale la pena AI-DLC de AWS y para cuál no?** Para un endpoint de este tamaño, el resultado final fue casi idéntico y costó diez veces más tiempo. Parece valer la pena en cambios con decisiones ambiguas, varias personas o requisitos que deban auditarse. No vale la pena en cambios chicos y claros.
5. **¿Lo usarían en su proyecto? ¿Por qué?** Lo usaría de forma selectiva, no en cada tarea. Su mayor valor fue encontrar un error del enunciado (la ruta) y dejar un registro de las decisiones. Su costo fue el tiempo, el papeleo y la fricción de instalación. Para cambios pequeños de este proyecto preferiría el flujo directo con buenas pruebas; para cambios de seguridad o de reglas de negocio (RB-xx) usaría AI-DLC.

