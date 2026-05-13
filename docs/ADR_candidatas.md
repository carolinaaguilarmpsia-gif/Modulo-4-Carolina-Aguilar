# ADR Candidatas — Decisiones Arquitectónicas del SGAI
# `docs/adr/ADR_candidatas.md`

> **Propósito:** Registro de las decisiones arquitectónicas identificadas como candidatas a ADR formal durante la elaboración del DTI borrador v0.1. Cada ADR sigue el formato estándar: Título, Estado, Contexto, Decisión, Alternativas consideradas, Consecuencias y Criterio de revisión.
>
> **Convención de IDs:** `ADR-NNNN` — numeración secuencial.
> **Estados posibles:** Propuesta → En revisión → Aceptada → Deprecada → Superada.
>
> **Proceso de aprobación:** Una ADR pasa de "Propuesta" a "Aceptada" cuando el Arquitecto responsable y al menos 1 stakeholder técnico (Líder Técnico o Unidad de TI) la aprueban formalmente. Las ADRs aceptadas son **inmutables**; si se supera una decisión, se crea una nueva ADR que la reemplaza y se marca la original como "Superada".

---

## ADR-0001 — Adopción de Monolito Modular con Arquitectura Hexagonal y Stack Node.js + PostgreSQL

| Campo | Valor |
|-------|-------|
| **ID** | ADR-0001 |
| **Título** | Adopción de monolito modular con arquitectura hexagonal y stack Node.js + PostgreSQL |
| **Estado** | **Propuesta** — Pendiente de aprobación en Sprint 0 |
| **Fecha de creación** | 10/05/2026 |
| **Autor** | Equipo de Desarrollo SGAI |
| **Revisores** | Líder Técnico + Unidad de TI universitaria |
| **Documentos relacionados** | DTI_borrador.md §3, §5, §17; FSD_v1.md §2.4; BRD_v2.md §13 (restricciones) |
| **ADRs relacionadas** | ADR-0002, ADR-0003 |

### Contexto

El SGAI debe ser construido, desplegado y mantenido bajo las siguientes restricciones no negociables (ver DTI §1.5):

- **Equipo de desarrollo pequeño:** 2–4 desarrolladores sin especialistas en operaciones cloud.
- **Presupuesto CAPEX máximo:** USD 45.000 para el desarrollo completo de v1.0.
- **Operación on-premise:** El sistema debe ejecutarse en servidores locales de la Unidad de TI universitaria (Ubuntu 22.04 LTS), sin dependencia de infraestructura cloud pública.
- **Mantenibilidad por TI local:** El equipo de TI universitario debe poder operar y mantener el sistema después del lanzamiento, con conocimientos técnicos estándar (no especialistas en Kubernetes, microservicios distribuidos ni cloud).
- **Dominio con reglas de negocio fuertes:** Las máquinas de estados de DJ y Oferta Académica son complejas y deben estar protegidas contra acceso directo desde cualquier capa que no sea el dominio (UI, API, agentes externos).
- **Plazo de entrega MVP:** Q3 2026 — aproximadamente 4 meses desde la aprobación del BRD.

En este contexto se tomaron tres decisiones interrelacionadas:
1. El **estilo arquitectónico** del sistema (monolito modular vs. microservicios vs. serverless).
2. El **stack tecnológico** del backend (lenguaje, framework, ORM).
3. La **base de datos** (relacional vs. documental vs. columnar).

### Decisión

**Se adopta un monolito modular con arquitectura hexagonal (Ports & Adapters) en el núcleo de dominio, implementado con el siguiente stack tecnológico:**

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend | Node.js + TypeScript + Express.js | Node 20 LTS, TypeScript 5.x |
| ORM | Prisma | v5.x |
| Base de datos | PostgreSQL | v15 |
| Cola de tareas | Bull + Redis | Bull v4.x, Redis 7 |
| Frontend | React + Vite + TypeScript | React 18, Vite 5 |
| Proxy / Servidor web | Nginx | v1.24+ |
| Contenedores | Docker + Docker Compose | Docker 25+ |
| CI/CD | GitHub Actions | — |
| Testing | Jest (unitario + integración) + Playwright (E2E) + k6 (carga) | — |

**Arquitectura hexagonal:** El módulo `domain/` no tiene dependencias a Express, Prisma, React ni ningún framework externo. Los casos de uso son clases/funciones puras que dependen exclusivamente de interfaces (puertos). Los adaptadores implementan esas interfaces y viven en `infrastructure/`. Esto garantiza que las reglas de negocio (máquinas de estados, validaciones de DJ y Oferta Académica) son testeables unitariamente sin necesidad de base de datos, HTTP ni ninguna infraestructura.

**Módulos del monolito** (cada uno corresponde a un bounded context del dominio):
```
backend/
├── domain/
│   ├── declaracion-jurada/   (bounded context DJ)
│   ├── oferta-academica/     (bounded context Oferta)
│   ├── gestion-docente/      (bounded context Docente)
│   ├── gestion-academica/    (bounded context Académico)
│   ├── informacion-financiera/ (bounded context Financiero)
│   ├── administracion/       (bounded context Admin)
│   └── notificaciones/       (bounded context Notif)
├── infrastructure/
│   ├── persistence/          (adaptadores de BD - Prisma)
│   ├── legacy-adapters/      (adaptadores de sistemas legados)
│   ├── smtp/                 (adaptador de notificaciones)
│   └── auth/                 (adaptador JWT + LDAP)
└── api/
    └── controllers/          (adaptadores HTTP - Express)
```

### Alternativas Consideradas

#### Alternativa 1: Microservicios

| Aspecto | Evaluación |
|---------|-----------|
| Escalabilidad independiente por módulo | Beneficio teórico, no necesario para ≤ 200 usuarios concurrentes |
| Complejidad operativa | Alta — service discovery, distributed tracing, contratos de API entre servicios, gestión de fallos en cascada |
| Requisito de equipo | Requiere especialistas en DevOps/plataforma que no están disponibles |
| Costo de infraestructura | Múltiples instancias vs. 1 servidor on-premise |
| Tiempo de implementación | +3–6 meses adicionales vs. monolito para el mismo MVP |
| **Veredicto** | **Descartado** — el overhead no se justifica para el volumen, presupuesto y equipo disponibles |

#### Alternativa 2: Serverless (Functions as a Service)

| Aspecto | Evaluación |
|---------|-----------|
| Modelo de costo | Pay-per-use — no aplica a on-premise institucional |
| Cold starts | Impacta la latencia p95; incompatible con NFR-001 (< 2 s) en el peor caso |
| Operación on-premise | No tiene solución on-premise estándar sin Kubernetes (OpenFaaS) — complejidad alta |
| **Veredicto** | **Descartado** — incompatible con la restricción de operación on-premise (RES-02) |

#### Alternativa 3: Spring Boot (Java) como backend

| Aspecto | Evaluación |
|---------|-----------|
| Madurez del ecosistema | Muy alta — excelente soporte para arquitectura hexagonal |
| Footprint de memoria | 256–512 MB por instancia vs. 64–128 MB de Node.js — penalización en servidores con RAM limitada |
| Familiaridad del equipo de desarrollo | Baja — el equipo tiene mayor experiencia en JavaScript/TypeScript |
| Tiempo de desarrollo | Configuración inicial más lenta (Maven, Spring beans, etc.) |
| **Veredicto** | **Descartado** — mayor footprint de memoria y menor velocidad de desarrollo del equipo específico |

#### Alternativa 4: MongoDB como base de datos

| Aspecto | Evaluación |
|---------|-----------|
| Flexibilidad de schema | Beneficio para `campos_formulario` (JSON dinámico de DJ) |
| Transacciones multi-documento | Disponible pero más compleja que en PostgreSQL; no es el punto fuerte de MongoDB |
| Requisito de máquinas de estados | Las transiciones de estado de DJ y Oferta Académica requieren transacciones ACID fuertes — PostgreSQL es superior |
| Soporte nativo en Ubuntu | Disponible, pero el equipo de TI tiene más experiencia con PostgreSQL |
| JSON nativo | PostgreSQL 15 tiene soporte nativo de JSONB — cubre el caso de `campos_formulario` |
| **Veredicto** | **Descartado** — PostgreSQL cubre todos los casos de uso con mejor soporte para transacciones ACID |

### Consecuencias

**Positivas:**
- Desarrollo más rápido: un solo repositorio, un solo despliegue, sin complejidad de comunicación inter-servicio.
- Testeabilidad del dominio: las reglas de negocio son testeables unitariamente sin infraestructura.
- Operación simple: Docker Compose en un servidor Ubuntu estándar.
- Costo operativo bajo: USD 6.000/año de OPEX con el stack elegido.
- Familiaridad del equipo: Node.js/TypeScript y PostgreSQL son conocidos por el equipo.

**Negativas / Riesgos aceptados:**
- **Escalabilidad horizontal limitada:** Un monolito escala verticalmente más fácilmente que horizontalmente. Para el volumen actual (≤ 200 concurrentes) no es un problema. Si el sistema crece a 5.000+ concurrentes, se requerirá una revisión de arquitectura.
- **Módulos menos independientes:** Los módulos del monolito comparten el mismo proceso de despliegue. Un bug crítico en un módulo puede afectar a todos. Mitigado con tests y feature flags en versiones futuras.
- **Deuda técnica de migración a microservicios:** Si en v3.0+ se necesita escalar independientemente los módulos, la arquitectura hexagonal facilita la extracción a microservicios (los puertos y adaptadores ya están definidos), pero requiere esfuerzo adicional.

### Criterio de Revisión

Esta ADR debe ser revisada si:
- El número de usuarios concurrentes supera 1.000 de forma sostenida.
- El tiempo de build + test supera 10 minutos en CI (señal de que el monolito está creciendo demasiado).
- Se incorpora un módulo con requisitos de escalabilidad radicalmente diferentes (ej.: módulo de streaming de video para clases online).

**Próxima revisión programada:** Q1 2027 (post-lanzamiento de v1.0, con datos reales de carga).

---

## ADR-0002 — Estrategia de Integración con Sistemas Legados: Adaptadores de Solo Lectura con Modo Degradado

| Campo | Valor |
|-------|-------|
| **ID** | ADR-0002 |
| **Título** | Estrategia de integración con sistemas legados: adaptadores de solo lectura con modo degradado |
| **Estado** | **Propuesta** — Pendiente de validación en POC-01 (Sprint 0) |
| **Fecha de creación** | 10/05/2026 |
| **Autor** | Equipo de Desarrollo SGAI |
| **Revisores** | Líder Técnico + Unidad de TI universitaria + Proveedor de sistemas legados |
| **Documentos relacionados** | DTI_borrador.md §2.2, §8; FSD_v1.md §8; BRD_v2.md §11 (BR-009, BR-010), §13 (restricciones); PRD_v1.md §9; POC-01 |
| **ADRs relacionadas** | ADR-0001 |

### Contexto

El SGAI necesita acceder a datos que residen en dos sistemas externos que preexisten a este proyecto:

1. **Sistema de Nómina:** Fuente de verdad de las boletas de pago. Tiene entre 5 y 15+ años de antigüedad. Sin documentación de API actualizada. No puede ser modificado bajo ninguna circunstancia (RES-03).
2. **Sistema de Información Institucional:** Fuente de verdad de materias, carreras, asignaciones docentes y carga horaria. Mismas características de antigüedad y restricción que el sistema de nómina.

Los datos de estos sistemas son necesarios en el SGAI para:
- Mostrar boletas de pago al docente (FSD-UC-005).
- Pre-cargar materias en los trámites de oferta académica (FSD-UC-003).
- Mostrar horarios y carga horaria al docente (FSD-UC-004).

El mecanismo de integración disponible es **desconocido hasta completar el Sprint 0 / POC-01**. Los mecanismos posibles son: REST API, consulta a base de datos en solo lectura, archivo de exportación programado (CSV/XML/JSON), o combinación de estos.

### Decisión

**Se adopta el patrón Adapter (Hexagonal Architecture) para toda integración con sistemas legados, con las siguientes propiedades invariantes:**

1. **Solo lectura absoluta:** Los adaptadores del SGAI solo leen datos de los sistemas legados. Nunca escriben, actualizan ni borran datos en ellos. Esta restricción se implementa tanto a nivel de interfaz (`ILegacyAdapter` solo tiene métodos `fetch*()`) como a nivel de acceso a BD (si aplica: credenciales de solo lectura, usuario de BD sin permisos DML).

2. **Interfaz común `ILegacyAdapter`:** Todos los adaptadores implementan la misma interfaz. El dominio del SGAI solo conoce la interfaz, nunca la implementación concreta. Esto permite:
   - Intercambiar el mecanismo de integración (de CSV a REST, por ejemplo) sin cambiar el dominio.
   - Usar un adaptador mock/stub en los tests unitarios del dominio.
   - Añadir nuevas fuentes de datos sin modificar el dominio.

3. **Sincronización periódica con caché local:** Los datos de los sistemas legados se sincronizan al sistema de BD local del SGAI mediante un proceso batch programado (cron job). El SGAI sirve los datos desde su propia BD, no consulta el sistema legado en tiempo real en cada request del usuario. Esto garantiza:
   - Operación en modo degradado si el legado no está disponible.
   - Latencia de respuesta al usuario independiente de la latencia del sistema legado.
   - NFR-001 cumplible (p95 < 2 s) sin depender del rendimiento del legado.

4. **Modo degradado obligatorio:** Si la sincronización con un sistema legado falla, el SGAI muestra los últimos datos sincronizados con:
   - Timestamp de última sincronización visible al usuario.
   - Banner de advertencia en la UI: "Datos de horarios actualizados al [fecha]. El sistema de información institucional no está disponible en este momento."
   - Log de error en el sistema de observabilidad del SGAI.
   - Alerta automática a la Unidad de TI si la sincronización falla 3 veces consecutivas.

5. **Frecuencia de sincronización:**
   - Sistema de Información Institucional (materias, asignaciones): 1 vez al día, en horario fuera de pico (2:00 AM).
   - Sistema de Nómina (boletas de pago): 1 vez al día, máximo 24 h después de la liquidación mensual.

### Estructura de los Adaptadores

```
infrastructure/
└── legacy-adapters/
    ├── ILegacyNominaAdapter.ts        (interfaz)
    ├── ILegacySistemaInstitucionalAdapter.ts  (interfaz)
    ├── implementations/
    │   ├── RestNominaAdapter.ts        (implementación REST — si aplica)
    │   ├── DbReadNominaAdapter.ts      (implementación BD solo lectura — si aplica)
    │   ├── CsvNominaAdapter.ts         (implementación CSV batch — si aplica)
    │   └── ...                         (la implementación se define post-POC-01)
    └── mock/
        ├── MockNominaAdapter.ts        (para tests)
        └── MockSistemaInstitucionalAdapter.ts
```

> **La implementación concreta del adaptador (REST, BD o CSV) se determina en el Sprint 0 (POC-01).** Esta ADR define la estrategia e invariantes; la implementación específica se documenta en un ADR complementario (ADR-0002b) post-POC-01.

### Alternativas Consideradas

#### Alternativa 1: Consulta en tiempo real al sistema legado en cada request del usuario

| Aspecto | Evaluación |
|---------|-----------|
| Datos siempre actualizados | Ventaja teórica |
| Latencia al usuario | Alta dependencia de la disponibilidad y rendimiento del sistema legado |
| Disponibilidad | Si el legado cae, el módulo del SGAI cae con él |
| Carga sobre el sistema legado | Agrega carga a un sistema ya en producción; riesgo de degradación del legado |
| **Veredicto** | **Descartado** — viola el NFR-001 (p95 < 2 s) en escenarios de latencia del legado y viola el principio de modo degradado |

#### Alternativa 2: Replicación completa del esquema de los sistemas legados en la BD del SGAI

| Aspecto | Evaluación |
|---------|-----------|
| Independencia total del legado | Alta |
| Complejidad de sincronización | Alta — requiere gestionar conflictos, deltas y cambios de schema |
| Riesgo de inconsistencia | Alto si el schema del legado cambia sin aviso |
| Scope del proyecto | Excede el presupuesto y el plazo de v1.0 |
| **Veredicto** | **Descartado** — excede el presupuesto y añade complejidad innecesaria para los datos requeridos |

#### Alternativa 3: Modificar los sistemas legados para añadir APIs

| Aspecto | Evaluación |
|---------|-----------|
| Solución ideal a largo plazo | Sí |
| Posibilidad en v1.0 | No — RES-03 prohíbe modificar los sistemas legados |
| Riesgo de estabilidad | Alto — modificar sistemas legados críticos puede afectar la nómina de 1.500+ docentes |
| **Veredicto** | **Descartado** — violación directa de RES-03 |

### Consecuencias

**Positivas:**
- El SGAI es resiliente a la caída de los sistemas legados.
- El dominio es independiente del mecanismo de integración (testeable con mocks).
- La latencia del usuario no depende del rendimiento del sistema legado.
- Los sistemas legados no son modificados ni sobrecargados.

**Negativas / Riesgos aceptados:**
- **Desfase de datos:** Los datos del SGAI pueden tener hasta 24 horas de antigüedad respecto al sistema legado. Para boletas de pago y asignaciones docentes, este desfase es aceptable según la validación con usuarios (MRD_v1.md §3.4).
- **Dependencia del mecanismo de integración disponible:** Si el sistema legado no tiene ningún mecanismo de integración viable (sin API, sin acceso a BD, sin exportación), el módulo de boletas y horarios no puede implementarse en v1.0. Este riesgo es mitigado por el POC-01 obligatorio en Sprint 0.
- **Mantenimiento del cron job de sincronización:** El proceso batch debe ser monitorizado y alertado ante fallos. Aumenta la superficie de mantenimiento del sistema.

### Criterio de Revisión

Esta ADR debe ser revisada si:
- El POC-01 no encuentra ningún mecanismo de integración viable con los sistemas legados.
- El desfase de 24 horas es reportado como inaceptable por los usuarios (encuesta post-lanzamiento).
- Uno de los sistemas legados es reemplazado o modernizado con API nativa.

**Condición de aprobación:** Esta ADR pasa a "Aceptada" después de que el POC-01 confirme que existe al menos un mecanismo de integración viable. Si el POC-01 falla, se actualiza esta ADR con las conclusiones y se define una estrategia alternativa (posiblemente posponer los módulos de boletas e información laboral a v1.1).

---

## ADR-0003 — Mecanismo de Autenticación: JWT Stateless con Integración LDAP/AD Institucional

| Campo | Valor |
|-------|-------|
| **ID** | ADR-0003 |
| **Título** | Mecanismo de autenticación: JWT stateless con integración LDAP/AD institucional |
| **Estado** | **Propuesta** — Pendiente de revisión de seguridad con Unidad de TI y Asesoría Legal |
| **Fecha de creación** | 10/05/2026 |
| **Autor** | Equipo de Desarrollo SGAI |
| **Revisores** | Líder Técnico + Unidad de TI + Asesoría Legal (cumplimiento Ley 164) |
| **Documentos relacionados** | DTI_borrador.md §13; FSD_v1.md §4.1 (FSD-UC-001); PRD_v1.md §7 (PRD-REQ-001); BRD_v2.md §12 (RB-04, RB-07) |
| **ADRs relacionadas** | ADR-0001, ADR-0002 |

### Contexto

El SGAI debe autenticar a 4 tipos de usuarios (Docente, Administrador de Facultad, Técnico DPA, Administrador del Sistema) con las siguientes restricciones:

- La universidad ya cuenta con un **directorio de usuarios institucional** (LDAP o Active Directory) que gestiona las credenciales de toda la comunidad universitaria. Los docentes y administrativos ya tienen cuentas en este directorio.
- **No se puede crear un sistema de identidad paralelo** — esto crearía doble gestión de contraseñas y sería rechazado por la Unidad de TI y los usuarios.
- El sistema opera **on-premise**, sin acceso a servicios de identidad cloud (AWS Cognito, Auth0, Azure AD B2C) sin aprobación de la Unidad de TI.
- El control de acceso debe ser **granular por rol** (RBAC): cada endpoint del SGAI está disponible solo para los roles con permiso explícito.
- La **Ley 164 de Bolivia** requiere protección de datos de acceso y manejo seguro de credenciales.
- La regla de negocio RB-07 establece **bloqueo temporal tras 5 intentos fallidos de autenticación**.

### Decisión

**Se adopta autenticación JWT stateless con validación de credenciales contra el directorio LDAP/AD institucional en el login, y almacenamiento local de cuentas en la BD del SGAI post-primer login.**

**Flujo de autenticación:**

```
1. Usuario envía [email + contraseña] a POST /auth/login
2. API SGAI hace BIND al servidor LDAP/AD con las credenciales del usuario
3a. Si el BIND es exitoso:
    - Crear/actualizar cuenta del usuario en la BD local del SGAI (nombre, email, rol asignado)
    - Generar JWT firmado con: { userId, email, rol, facultadId, iat, exp }
    - Retornar JWT al cliente
3b. Si el BIND falla:
    - Incrementar contador de intentos fallidos en BD local
    - Si intentos >= 5: bloquear cuenta 15 minutos (RB-07)
    - Retornar HTTP 401 con mensaje genérico (nunca especificar si falla email o contraseña)
4. Cliente almacena JWT en memoria (no en localStorage por seguridad en contexto web)
5. Cada request posterior incluye JWT en el header Authorization: Bearer <token>
6. Middleware de Express valida la firma del JWT y extrae rol/userId para el control de acceso
7. El JWT expira tras 8 horas de inactividad (expiración por inactividad implementada en el middleware)
```

**Configuración del JWT:**
- Algoritmo de firma: HS256 (suficiente para on-premise; RS256 para entornos con múltiples servicios verificadores).
- Payload: `{ userId, email, rol, facultadId, iat, exp }`. No incluir datos sensibles (salario, CI).
- Tiempo de expiración: 8 horas absolutas. El middleware de inactividad puede renovar el token si hay actividad antes de los 8 h.
- Secreto JWT: variable de entorno; rotación semestral.

**Control de acceso (RBAC) en cada endpoint:**
```typescript
// Ejemplo de middleware de rol
requireRole([Rol.DOCENTE])(req, res, next)          // Solo docentes
requireRole([Rol.ADMIN_FACULTAD])(req, res, next)    // Solo admins de facultad
requireRole([Rol.TECNICO_DPA, Rol.ADMIN_SISTEMA])(req, res, next) // DPA o admin
```

**Manejo de la relación LDAP ↔ BD local:**
- El directorio LDAP es la fuente de verdad de credenciales (contraseña). Nunca se almacena la contraseña en la BD del SGAI.
- La BD local del SGAI almacena: userId, email, nombre completo, rol en el SGAI, facultad asignada, estado (activo/bloqueado), contador de intentos fallidos.
- El administrador del SGAI asigna el rol de cada usuario en el SGAI (no proviene del LDAP, ya que el LDAP puede no tener el concepto de "Técnico DPA" o "Administrador de Facultad").

**Alternativa de contingencia (si LDAP no está disponible en Sprint 0):** El SGAI puede operar con autenticación local (password hasheado con bcrypt en BD propia) durante el período de desarrollo y demo, con migración a LDAP antes del go-live. Este fallback se documenta como opción configurada por variable de entorno (`AUTH_MODE=ldap|local`).

### Alternativas Consideradas

#### Alternativa 1: Sesiones en servidor (server-side sessions + Redis)

| Aspecto | Evaluación |
|---------|-----------|
| Revocación inmediata de sesiones | Ventaja — la sesión se invalida al borrarla de Redis |
| Complejidad operativa | Requiere Redis como servicio de sesiones (ya requerido para Bull, pero añade responsabilidad) |
| Escalabilidad horizontal | Requiere sticky sessions o Redis compartido entre instancias |
| Stateless | No — el servidor mantiene estado de sesión |
| **Veredicto** | **Descartado** — la revocación inmediata no es un requisito crítico para el SGAI (sesiones de 8 h son aceptables); JWT simplifica la arquitectura |

#### Alternativa 2: OAuth2 / OpenID Connect con proveedor externo (Auth0, Azure AD B2C)

| Aspecto | Evaluación |
|---------|-----------|
| Estándar de la industria | Sí — muy recomendado para sistemas en cloud |
| Operación on-premise | Requiere servicio externo cloud o despliegue de Keycloak on-premise |
| Complejidad | Alta — flujos OAuth2, refresh tokens, consent screens |
| Costo | Auth0/Azure AD B2C tienen costos por usuario activo; Keycloak requiere expertise operativo |
| Integración con LDAP institucional | Keycloak puede integrar con LDAP — pero añade una capa adicional |
| **Veredicto** | **Descartado para v1.0** — añade complejidad operativa incompatible con el equipo de TI local. Se evalúa para v2.0 si la universidad adopta Keycloak o Azure AD institucional. |

#### Alternativa 3: Autenticación local sin LDAP (contraseñas propias del SGAI)

| Aspecto | Evaluación |
|---------|-----------|
| Independencia del LDAP | Alta |
| Experiencia del usuario | Mala — los usuarios tendrían otra contraseña que gestionar |
| Aceptación institucional | Muy baja — la Unidad de TI rechazará duplicar la gestión de identidades |
| Seguridad | Requiere gestión completa del ciclo de vida de contraseñas (reset, caducidad, complejidad) |
| **Veredicto** | **Descartado** — inaceptable institucionalmente; solo como fallback temporal en desarrollo |

### Consecuencias

**Positivas:**
- Los usuarios usan sus credenciales institucionales existentes — sin onboarding de contraseñas.
- JWT stateless elimina la consulta al LDAP en cada request (solo en el login).
- Simple de implementar y operar on-premise.
- El RBAC granular por endpoint protege las reglas de negocio RB-01 a RB-07.

**Negativas / Riesgos aceptados:**
- **Revocación de tokens:** Si se necesita invalidar un JWT antes de su expiración (ej.: usuario dado de baja de urgencia), se requiere una blacklist en Redis o esperar a que el token expire (máx. 8 h). Para el contexto universitario, 8 horas es aceptable.
- **Dependencia de la disponibilidad del LDAP en el login:** Si el servidor LDAP/AD está caído, los usuarios no pueden hacer login. Mitigado con el modo `AUTH_MODE=local` para emergencias operativas.
- **Secreto JWT como punto único de fallo:** Si el JWT secret se compromete, todos los tokens activos son vulnerables. Mitigado con rotación semestral y almacenamiento en variables de entorno (nunca en código).

### Criterio de Revisión

Esta ADR debe ser revisada si:
- La universidad adopta un proveedor de identidad moderno (Keycloak, Azure AD, Google Workspace para educación) que haga redundante la integración LDAP directa.
- Los tokens JWT comprometidos se convierten en un vector de ataque real en producción.
- El SGAI se expande a múltiples universidades con diferentes directorios de identidad (el JWT multi-tenant requiere revisión de la estrategia).

**Condición de aprobación:** Esta ADR pasa a "Aceptada" después de que la Unidad de TI confirme la disponibilidad y el protocolo del servidor LDAP/AD institucional y que la Asesoría Legal no identifique impedimentos de cumplimiento Ley 164 con el flujo propuesto.

---

## Registro de ADRs

| ADR | Título corto | Estado | Fecha | Aprobada por |
|-----|-------------|--------|-------|--------------|
| ADR-0001 | Monolito modular + arquitectura hexagonal + Node.js + PostgreSQL | Propuesta | 10/05/2026 | Pendiente |
| ADR-0002 | Adaptadores de solo lectura con modo degradado para sistemas legados | Propuesta | 10/05/2026 | Pendiente (post-POC-01) |
| ADR-0003 | JWT stateless + integración LDAP/AD institucional | Propuesta | 10/05/2026 | Pendiente (revisión seguridad) |
| ADR-0004 | *(Reservada)* Despliegue on-premise con Docker Compose en servidores universitarios | Propuesta | Pendiente | — |

---

## Historial de Cambios

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| v1.0 | 10/05/2026 | Equipo SGAI | Versión inicial — 3 ADRs candidatas completas (ADR-0001, ADR-0002, ADR-0003); ADR-0004 reservada |
