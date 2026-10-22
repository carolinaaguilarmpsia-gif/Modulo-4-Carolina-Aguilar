# Práctica: AI-DLC de AWS con y sin herramienta

> Copien este archivo en su repositorio como `docs/practicas/aidlc-comparacion.md` y complétenlo. Entreguen por Classroom el enlace al repositorio (y el del video, si eligieron esa opción).

## 1. Datos

- **Modalidad:** individual / grupo
- **Repositorio:**
- **Rama sin herramienta (A):** `feature-sin-aidlc`
- **Rama con herramienta (B):** `feature-con-aidlc`
- **Video (opcional):**

**Responsables** (obligatorio si es en grupo; cada aporte debe verse en los commits con la identidad de su autor):

| Integrante | Qué hizo | Commits o PR |
|---|---|---|
| | | |

## 2. El feature

Pequeño, de backend y comprobable en minutos (por ejemplo, un endpoint nuevo con sus pruebas). En 5 a 10 líneas: qué hace, entradas y salidas, errores esperados y criterio de aceptación. Si lo escribieron en `feature.md`, enlácenlo aquí.

## 3. Versión A: sin la herramienta

- Cómo trabajaron (asistente de IA directo o flujo del curso):
- Resultado (enlace a la rama o al PR):

## 4. Versión B: con AI-DLC de AWS 2.11.0 (perfil Express)

- Comando usado: `/aidlc express …`
- Salida de `aidlc version`:
- Puertas que revisaron y qué corrigieron con Request Changes (Reverse Engineering, Requirements Analysis, Code Generation, Build and Test):
- Artefactos versionados: `aidlc/` (estado, auditoría, `requirements.md`, `code-generation-plan.md`, `test-results.md`) y `.aidlc-version`.

## 5. Comparación

| Aspecto | A · sin herramienta | B · con AI-DLC de AWS |
|---|---|---|
| Tiempo total | | |
| Veces que tuvieron que intervenir o corregir | | |
| Artefactos que quedaron en el repositorio | | |
| ¿Las pruebas pasan? (ejecutadas por ustedes) | | |
| Qué salió mejor | | |
| Qué salió peor | | |

## 6. Conclusiones

1. ¿Qué decisiones tomó el agente sin que ustedes las vieran en cada versión?
2. ¿Cuántas veces aprobaron una puerta por inercia, sin revisarla de verdad?
3. ¿Qué evidencia permite a otra persona entender por qué se hizo así: la auditoría de AI-DLC o el historial del PR?
4. ¿Para qué tamaño de cambio vale la pena AI-DLC de AWS y para cuál no?
5. **¿Lo usarían en su proyecto? ¿Por qué?**

## 7. Antes de entregar

- [ ] Las dos ramas están en el repositorio y las pruebas pasan en ambas.
- [ ] `aidlc/` y `.aidlc-version` están versionados en la rama B.
- [ ] No hay secretos, `.env` ni archivos `*.local.json` en los commits.
- [ ] Si es en grupo, la tabla de responsables está completa.
