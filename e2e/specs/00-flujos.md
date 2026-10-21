# Flujos de SGAI (frontend) — alcance de la suite E2E

Un flujo por línea: qué hace la persona y qué debe ver al final. Lo que no está acá, no se probó
(el chat del orquestador de atención backend, por ejemplo, no tiene UI propia todavía — fuera de alcance).

## A · Autenticación
- **A1.** Un docente inicia sesión con credenciales válidas → aterriza en "Mis declaraciones juradas" con su nombre y rol visibles en la barra superior.
- **A2.** Alguien intenta iniciar sesión con una contraseña incorrecta → ve un mensaje de error y permanece en `/login`.
- **A3.** Un usuario logueado cierra sesión → vuelve a `/login` y ya no puede ver el listado de DJ.
- **A4.** Alguien sin sesión visita directamente una URL protegida (`/declaraciones-juradas`) → es redirigido a `/login`.

## B · Asistente de trámites (chat público, pantalla de login)
- **B1.** Alguien pregunta por un trámite que matchea por palabra clave (p. ej. certificado de trabajo) → ve la respuesta con la etiqueta "Keyword" y la fuente `db.json`.
- **B2.** Alguien pregunta algo fuera de alcance de la DPA → ve el aviso "fuera de alcance" junto con el listado de trámites disponibles.

## C · Declaraciones juradas — listado y creación (rol DOCENTE)
- **C1.** Un docente sin DJ ve el listado vacío con la invitación a crear la primera.
- **C2.** Un docente completa el formulario de nueva DJ con datos válidos → ve el mensaje de éxito y es redirigido al detalle en estado BORRADOR.
- **C3.** Un docente intenta enviar el formulario con la descripción de actividades demasiado corta → ve el error de validación del campo y no navega.
- **C4.** Un docente abre el detalle de una DJ propia → ve sus datos, su estado y su historial de auditoría.

## D · Transiciones de estado (flujo entre roles)
- **D1.** Un docente envía una DJ en BORRADOR a Facultad → el estado pasa a "En revisión — Facultad" y queda registrado en el historial.
- **D2.** Un Admin. Facultad aprueba una DJ en revisión de su propia facultad → pasa a "Aprobada" y el panel de acciones muestra "Trámite cerrado".
- **D3.** Un Admin. Facultad intenta devolver una DJ sin escribir observaciones → el botón de confirmar permanece deshabilitado hasta escribir al menos 10 caracteres.
- **D4.** Un docente con vinculación inactiva (Carlos Paz) intenta crear una DJ → ve el aviso "Vinculación inactiva" (RB-01) y el formulario no se envía.

## E · Asistente MCP — agente sobre DJ (roles ADMIN_FACULTAD / TECNICO_DPA)
- **E1.** Un Admin. Facultad le pregunta al agente algo de solo lectura → ve una respuesta nueva del asistente en el chat.
- **E2.** Un Admin. Facultad le pide al agente aprobar una DJ → ve una tarjeta de confirmación con la vista previa antes de que se ejecute nada.
- **E3.** El Admin. Facultad confirma la acción propuesta → la tarjeta de confirmación se retira y aparece el resultado.
- **E4.** El Admin. Facultad cancela la acción propuesta → la tarjeta se retira sin que el estado de la DJ cambie.

**Total: 18 flujos, 5 secciones.** El Planner corre una sección a la vez (nunca las 18 juntas).
