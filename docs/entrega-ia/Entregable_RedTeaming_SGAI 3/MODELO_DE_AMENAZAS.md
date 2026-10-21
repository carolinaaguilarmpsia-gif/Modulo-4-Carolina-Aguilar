# Modelo de amenazas — capa de IA de SGAI

> Alcance: los tres componentes de SGAI donde un LLM participa en decisiones.
> - **Orquestador de atención** (`POST /api/v1/orquestador/atender`): un LLM clasifica la intención y extrae el nombre de un docente, y el código consulta DJ.
> - **Agente DJ con MCP** (`POST /api/v1/agente-dj/preguntar|confirmar`): un bucle ReAct que usa herramientas MCP de lectura y escritura sobre Declaraciones Juradas.
> - **Asistente de trámites DPA** (`POST /api/v1/asistente-tramites/preguntar`, chat público del login): router keyword → RAG (Ollama) → LLM.
>
> Proveedor: Groq `openai/gpt-oss-20b` (clasificador y agente). Embeddings: Ollama `nomic-embed-text`. Solo se usaron datos ficticios (usuarios y DJ semilla).

| Elemento | Pregunta | En SGAI |
|---|---|---|
| **Activos** | ¿Qué queremos proteger? | Estado y contenido de las Declaraciones Juradas (`camposFormulario`: cargo, actividades, carga horaria), que son datos personales según la Ley 164. También la integridad del flujo de aprobación de DJ (RB-03 y RB-06), el aislamiento por facultad (RB-05), el historial de conversaciones del orquestador (`conversaciones.json`), la lógica de guardrails del prompt del agente y el costo/cuota del proveedor LLM (Groq, 8000 TPM). |
| **Actores** | ¿Quién podría atacar? | Un **Admin. de Facultad curioso o malicioso** que intenta ver o aprobar DJ de otra facultad. Un **docente malicioso** que escribe instrucciones dentro de su propia DJ para manipular al agente revisor. Un **usuario autenticado** que consigue un `conversacionId` ajeno. Un **anónimo** en el chat público del login que abusa del LLM (consumo o inyección). |
| **Puntos de entrada** | ¿Por dónde entra información? | El mensaje del usuario al orquestador y al agente. El `conversacionId` del body (lo controla el cliente). Los **resultados de herramientas MCP**, que devuelven `camposFormulario` escrito por el docente y entran al contexto del agente. El estado persistido de la conversación (`docenteId` heredado entre turnos). La pregunta pública del asistente de trámites y los textos de `db.json` usados en el RAG. |
| **Fronteras de confianza** | ¿Dónde cambia el nivel de confianza? | Usuario → API: no confiable (JWT + Zod). API → prompt: el `SYSTEM_PROMPT` es confiable, pero el mensaje va en el mismo texto que las instrucciones del clasificador. **Herramientas MCP → contexto del agente**: NO confiable, porque el contenido de la DJ lo escribe el docente. **LLM → decisión de a quién consultar**: NO confiable, porque el nombre extraído por el LLM no debe cambiar *con qué permisos* se consulta. Estado persistido → turno actual: el estado de la conversación no es confiable si no se verifica su dueño. |
| **Ataques** | ¿Qué podría intentar? | (1) Pedir al orquestador DJ de un docente de otra facultad (**AI-SEC-001**). (2) Reusar el `conversacionId` de otra persona para heredar su contexto (**AI-SEC-002**). (3) Pretexto de autoridad para que el agente apruebe sin confirmación (**AI-SEC-003**). (4) Extraer el prompt del sistema del agente (**AI-SEC-004**). (5) Inyección indirecta en `camposFormulario` para que el agente proponga APROBAR (**AI-SEC-005**). (6) Inyección directa clásica («Ignora todas las instrucciones…») contra el clasificador del orquestador para forzar la consulta de DJ de otra facultad (**AI-SEC-008**). (7) Envenenar `db.json`, la base de conocimiento del RAG, con un requisito falso que pide credenciales (**AI-SEC-007**). Fuera de las pruebas: agotar la cuota de Groq desde el chat público. |
| **Impacto** | ¿Qué pasa si lo consigue? | Divulgación de datos personales de docentes a una facultad que no corresponde (Ley 164, RB-05). Aprobación indebida de una DJ si quien confirma no revisa la propuesta. Un atacante que conoce los guardrails del prompt puede diseñar mejores evasiones. Denegación de servicio del chat de IA por cuota agotada. |
| **Mitigaciones** | ¿Qué control reduce el riesgo? | **Aplicadas en código (5, todas con retest en 0/3):** el orquestador consulta DJ con el alcance del actor autenticado (AI-SEC-001/002/008); la herramienta de escritura del agente DJ solo se ofrece al LLM si el mensaje del usuario pide explícitamente una transición — política de herramientas fuera del modelo (AI-SEC-005); la respuesta final del agente se valida contra ecos literales del `SYSTEM_PROMPT` (AI-SEC-004); el asistente de trámites filtra en la salida cualquier pedido de credenciales o correo fuera del dominio institucional, en el único punto por el que pasan los 3 caminos del router (AI-SEC-007). **Ya existentes:** el actor del MCP viene siempre del JWT; `confirmar` exige el mismo `userId`; `MAX_PASOS = 6`; el dominio valida RB-05 al transicionar. **Pendiente:** verificar la procedencia de `db.json` (hash/firma de origen) y un límite de tokens por usuario y por minuto. |

## Diagrama de flujo (dónde hay riesgo)

```
Usuario ──► API (JWT+Zod) ──► Orquestador / Agente ──► LLM (Groq) ──► Herramientas MCP / DJService ──► Repos DJ
  (1)           (2)                  (3)                   (4)                    (5)                        (6)
```

1. Mensaje y `conversacionId` no confiables. Aquí entran AI-SEC-001/002/003/004/008.
2. Se decide la identidad (JWT). **Todo permiso debe salir de aquí**, no de lo que diga el LLM.
3. Conviven instrucciones confiables y datos no confiables: el mensaje y el `camposFormulario` que devuelven las herramientas. Aquí entra AI-SEC-005.
4. Salida probabilística: el LLM puede obedecer al atacante (clasificar, extraer un nombre, proponer una acción).
5. **El modelo PROPONE, la aplicación DECIDE.** AI-SEC-001 existía porque el código usaba el nombre elegido por el LLM para cambiar *con qué identidad* consultaba; AI-SEC-005 se cerró con el mismo principio, sacándole al modelo la herramienta de escritura cuando el usuario no la pidió.
6. Mínimo privilegio y validación de salida: la consulta solo alcanza lo que la sesión autoriza (RB-05), y lo que sale hacia el usuario se filtra contra fugas del prompt (AI-SEC-004) y contra pedidos de credenciales (AI-SEC-007).
