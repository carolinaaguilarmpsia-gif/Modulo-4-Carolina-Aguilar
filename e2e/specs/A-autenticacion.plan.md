# Plan — A. Autenticación

**Seed:** `e2e/seed.spec.ts`
**Explorado en vivo:** login válido, logout, y la redirección de RequireAuth (Chromium real contra `:5173`/`:3001`).

## 1. Login exitoso
**Pasos:**
1. Ir a `/login`.
2. Completar "Correo institucional" con `docente@universidad.edu.bo` y "Contraseña" con `Demo1234!`.
3. Click en "Iniciar sesión".

**Resultado esperado:** aterriza en `/declaraciones-juradas`, la barra superior muestra el link "Mis declaraciones" y el botón "Cerrar sesión".

## 1.2 Login con contraseña incorrecta
**Pasos:**
1. Ir a `/login`.
2. Completar con `docente@universidad.edu.bo` / `password-incorrecta`.
3. Click en "Iniciar sesión".

**Resultado esperado:** la URL sigue en `/login`, aparece una alerta (`role=alert`) con "No se pudo iniciar sesión".

## 1.3 Cerrar sesión
**Pasos:**
1. Login válido (igual que 1.1).
2. Click en "Cerrar sesión".

**Resultado esperado:** vuelve a `/login`; el link "Mis declaraciones" ya no está.

## 1.4 Acceso directo sin sesión
**Pasos:**
1. Sin loguearse, ir directo a `/declaraciones-juradas`.

**Resultado esperado:** redirige a `/login` (no se ve el listado).

## 1.5 (propuesto y descartado) "El mensaje de bienvenida del asistente es exactamente el saludo configurado"
Este caso proponía comparar el texto completo del saludo del chat de trámites con un string literal
copiado del componente. Se descarta de esta sección (pertenece a B, no a Autenticación) y además
viola la pregunta 3 (verificaría redacción fija, no una promesa de la interfaz) — si se quisiera
cubrir, se corregiría a "el panel del asistente está visible" en vez del texto exacto.

---

## Auditoría

| # | Caso propuesto | Decisión | Motivo |
|---|---|---|---|
| 1.1 | Login exitoso | **Aceptado** | Cubre A1, ruta feliz, sin ambigüedad de rol. |
| 1.2 | Login credenciales inválidas | **Aceptado** | Cubre A2. Se corrigió el resultado esperado: la propuesta original decía "ver el mensaje 'Usuario o contraseña incorrectos'" (texto exacto del backend) — se corrigió a verificar el `role=alert` con su título fijo de la UI ("No se pudo iniciar sesión"), no el mensaje que arma el backend, para no acoplar el test a la redacción del dominio. |
| 1.3 | Cerrar sesión | **Aceptado** | Cubre A3. |
| 1.4 | Acceso directo sin sesión | **Aceptado** | Cubre A4. |
| 1.5 | Saludo exacto del asistente | **Descartado** | Fuera de sección (es B) y verifica redacción fija, no una promesa de la interfaz — ver nota arriba. |

**4 aceptados, 0 corregidos de fondo (1 con el resultado esperado ajustado), 1 descartado.**
