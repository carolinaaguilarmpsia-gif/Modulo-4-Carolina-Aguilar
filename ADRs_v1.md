---
# ADR-0001: Adopción de Monolito Modular con Arquitectura Hexagonal, Node.js 20 y PostgreSQL 15

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0001 |
| Título | Adopción de monolito modular con arquitectura hexagonal, Node.js 20 y PostgreSQL 15 |
| Fecha | 10/05/2026 |
| Autor(es) | Carolina Aguilar |
| Estado | **Aceptada** |
| Alcance | Todo el sistema |
| Stakeholders consultados | Unidad de TI universitaria, Director DPA (sponsor) |

### 1. Contexto

El SGAI debe ser construido por un equipo de 1–4 desarrolladores con presupuesto CAPEX de USD 45.000 y plazo de entrega del MVP en Q3 2026. El sistema opera on-premise en servidores Ubuntu 22.04 LTS de la Unidad de TI universitaria, sin posibilidad de usar cloud pública sin aprobación (RES-02). El dominio contiene reglas de negocio fuertes y bien delimitadas: máquinas de estados de DJ y Oferta Académica, RBAC por rol, cumplimiento Ley 164 Bolivia. El volumen esperado es ≤ 200 usuarios concurrentes (1.500 docentes + 20 administradores). El equipo de TI universitario debe poder mantener y operar el sistema post-lanzamiento con conocimientos técnicos estándar. Las fuerzas en tensión son: simplicidad operativa vs. escalabilidad futura; velocidad de desarrollo vs. calidad del dominio; costo de infraestructura vs. disponibilidad.

### 2. Alternativas Consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|-------------|------|---------|------------------|
| A. Monolito modular + Hexagonal + Node.js + PostgreSQL | Simple de operar y desplegar; un solo repositorio; sin complejidad distribuida; familiar para el equipo; footprint de memoria bajo (64–128 MB); PostgreSQL ACID para máquinas de estados | Escala horizontal limitada (mitigable con réplicas de lectura); módulos comparten proceso de despliegue | USD 0 licencias; USD 45.000 desarrollo |
| B. Microservicios con Node.js | Escala independiente por módulo; deploy independiente | Requiere service discovery, distributed tracing, contratos de API; complejidad operativa incompatible con Unidad de TI local; +3–6 meses de desarrollo | USD 0 licencias; +USD 30.000 desarrollo adicional |
| C. Spring Boot (Java) + Hexagonal + PostgreSQL | Ecosistema maduro para arquitectura hexagonal; soporte empresarial | Footprint JVM 256–512 MB vs. 64–128 MB de Node.js; menor velocidad de desarrollo del equipo; mayor costo en servidores con RAM limitada | USD 0 licencias; estimación similar a A pero mayor tiempo |

### 3. Decisión

> **Elegimos la alternativa A: monolito modular con arquitectura hexagonal, Node.js 20 LTS + TypeScript 5.x, Express.js, Prisma 5 y PostgreSQL 15.**

El monolito modular es la elección óptima para el volumen esperado (≤ 200 concurrentes), el equipo disponible (1–4 devs) y las restricciones operativas (mantenimiento por TI local). La arquitectura hexagonal garantiza que las reglas de negocio (máquinas de estados de DJ y Oferta, RBAC, Ley 164) son independientes del stack y testeables unitariamente con cobertura ≥ 80 %. Node.js 20 LTS tiene menor footprint de memoria que JVM en servidores on-premise con RAM limitada y es conocido por el equipo. PostgreSQL 15 provee transacciones ACID requeridas por las máquinas de estados y soporte nativo JSONB para los `campos_formulario` dinámicos de las DJ.

### 4. Consecuencias

#### 4.1 Positivas
- Un solo repositorio, un solo despliegue: sin complejidad de comunicación inter-servicio.
- Las reglas de negocio son testeables unitariamente sin infraestructura (arquitectura hexagonal).
- Operación simple con Docker Compose en Ubuntu 22.04 LTS.
- Costo operativo bajo: USD 6.000/año con el stack elegido.
- Familiaridad del equipo con Node.js/TypeScript y PostgreSQL.

#### 4.2 Negativas / Costos
- Escala horizontal limitada: escala mejor verticalmente. Para ≤ 200 concurrentes no es problema; si crece a 5.000+, se requiere revisión de arquitectura.
- Módulos comparten proceso de despliegue: un bug crítico en un módulo puede afectar a todos. Mitigado con tests exhaustivos.
- Deuda técnica si en v3.0+ se necesita extraer módulos a microservicios (aunque la arquitectura hexagonal facilita esta extracción).

#### 4.3 Neutras / Observables
- El tiempo de build + test aumentará a medida que el monolito crezca. Si supera 10 minutos en CI, evaluar cache de build o separación de test suites.
- La arquitectura hexagonal requiere más archivos y capas que un MVC clásico; curva de aprendizaje inicial de 1–2 días para nuevos desarrolladores.

### 5. Impacto en el Sistema

- **Código:** Estructura `backend/domain/` (núcleo hexagonal sin dependencias externas) + `backend/infrastructure/` (adaptadores) + `backend/api/` (controllers Express).
- **Operaciones:** Docker Compose con 5 contenedores (Nginx, API, Worker, Scheduler, PostgreSQL, Redis). Sin Kubernetes.
- **Seguridad:** TypeScript strict previene errores de tipo; arquitectura hexagonal aisla el dominio de la infraestructura.
- **Equipo:** Requiere familiaridad con arquitectura hexagonal (puertos y adaptadores). Capacitación estimada: 1–2 días.
- **Costo:** USD 0 de licencias; hosting en servidores existentes de la Unidad de TI.

### 6. Plan de Reversión

- **Señales de alerta:** Build + test > 10 minutos en CI; usuarios concurrentes > 1.000 sostenidos; módulo con tiempos de respuesta que no mejoran con optimización de queries.
- **Costo de revertir:** Extraer un módulo a microservicio requiere aproximadamente 2–4 semanas de trabajo de ingeniería. La arquitectura hexagonal facilita la extracción (puertos y adaptadores ya están definidos).
- **Plan B:** Extraer primero el módulo de mayor carga (proyección: M-DJ o M-OFERTA) a un microservicio separado, manteniendo el resto como monolito.

### 7. Validación

- Cobertura de tests en `domain/` ≥ 80 % (medido en CI con `jest --coverage`).
- Cero imports de `@prisma/client`, `express`, `redis` o cualquier framework en `domain/` (verificado con lint rule personalizada).
- Latencia p95 < 2 s bajo 200 VUs (k6 en staging antes del go-live).
- Responsable: Carolina Aguilar. Plazo: antes del go-live v1.0 (Q3 2026).

### 8. Referencias

- Clean Architecture — Robert C. Martin (2017).
- Hexagonal Architecture — Alistair Cockburn: https://alistair.cockburn.us/hexagonal-architecture/
- Node.js 20 LTS: https://nodejs.org/en/blog/release/v20.0.0
- Prisma: https://www.prisma.io/docs

### 9. Historial

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| 1 | 10/05/2026 | Carolina Aguilar | Propuesta inicial |
| 2 | 10/05/2026 | Carolina Aguilar | Aceptada tras revisión de restricciones on-premise |

---

# ADR-0002: Estrategia de Integración con Sistemas Legados — Adaptadores de Solo Lectura con Modo Degradado

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0002 |
| Título | Adaptadores de solo lectura para sistemas legados con modo degradado |
| Fecha | 10/05/2026 |
| Autor(es) | Carolina Aguilar |
| Estado | **Aceptada** |
| Alcance | Módulos M-BOLETAS, M-INFO-LABORAL, M-OFERTA (pre-carga de materias) |
| Stakeholders consultados | Unidad de TI universitaria, Director DPA |

### 1. Contexto

El SGAI necesita acceder a datos que residen en dos sistemas legados que preexisten al proyecto: (1) el **Sistema de Nómina** (fuente de boletas de pago) y (2) el **Sistema de Información Institucional** (fuente de materias, carreras y asignaciones docentes). Ambos tienen 5–15+ años de antigüedad, sin documentación de API actualizada, y **no pueden ser modificados bajo ninguna circunstancia** (RES-03 del BRD: restricción técnica y organizacional). Los mecanismos de integración disponibles son desconocidos hasta el Sprint 0 (POC-01). Las fuerzas en tensión son: datos actualizados vs. disponibilidad del sistema; simplicidad de integración vs. independencia del SGAI; velocidad de respuesta al usuario vs. desfase de datos.

### 2. Alternativas Consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|-------------|------|---------|------------------|
| A. Adaptadores desacoplados + sincronización batch diaria + cache local | Independencia total de disponibilidad del legado; latencia del usuario no depende del legado; modo degradado graceful; sin sobrecarga sobre el legado | Desfase de hasta 24 h en datos; cron job adicional a mantener | Incluido en USD 45.000 CAPEX |
| B. Consulta en tiempo real al legado en cada request del usuario | Datos siempre actualizados | Latencia del usuario depende del legado; si el legado cae, el módulo cae; sobrecarga sobre sistema en producción; viola NFR-001 (p95 < 2 s) | Similar a A |
| C. Modificar los sistemas legados para añadir APIs | Solución ideal a largo plazo | Violación directa de RES-03 (no modificar legados); riesgo alto para sistemas de nómina en producción | +USD 50.000–100.000 estimado |

### 3. Decisión

> **Elegimos la alternativa A: adaptadores desacoplados implementando la interfaz `ILegacyAdapter`, con sincronización batch diaria y cache local en PostgreSQL, y modo degradado obligatorio cuando el legado no está disponible.**

La alternativa A es la única que respeta RES-03, cumple NFR-001 (latencia < 2 s sin depender del legado) y garantiza operación en modo degradado cuando el sistema legado no está disponible. El desfase de 24 horas en datos de boletas y horarios fue validado como aceptable por los usuarios en 87 % de las entrevistas (MRD_v1.1 §12, H-06 validada). La interfaz `ILegacyAdapter` permite intercambiar el mecanismo de integración (REST, BD solo lectura, CSV batch) sin cambiar el dominio, una vez que el POC-01 confirme qué mecanismo es factible.

### 4. Consecuencias

#### 4.1 Positivas
- El SGAI opera con resiliencia total a la caída de los sistemas legados.
- El dominio es independiente del mecanismo de integración (testeable con mocks).
- Los sistemas legados no son modificados ni sobrecargados.
- La latencia del usuario no depende del rendimiento del legado.

#### 4.2 Negativas / Costos
- Desfase de hasta 24 horas en boletas y horarios (validado como aceptable por usuarios).
- Cron job de sincronización requiere monitoreo y alertas ante fallos.
- La implementación concreta del adaptador (REST, BD o CSV) depende del resultado de POC-01.

#### 4.3 Neutras / Observables
- Si el POC-01 confirma que ningún mecanismo es factible, los módulos M-BOLETAS y M-INFO-LABORAL se posponen a v1.1 y el MVP funciona sin ellos.
- El conocimiento técnico de los sistemas legados (adquirido en POC-01) es una barrera de entrada para competidores (MRD_v1.1 §6.3).

### 5. Impacto en el Sistema

- **Código:** `infrastructure/legacy-adapters/ILegacyAdapter.ts` (interfaz) + implementaciones en `infrastructure/legacy-adapters/implementations/`.
- **Operaciones:** Cron job diario a las 2:00 AM; monitoreo de `sync_log`; alerta si fallos consecutivos ≥ 3.
- **Seguridad:** Credenciales de solo lectura para el legado (nunca DML); credenciales en variables de entorno.
- **Equipo:** El líder técnico debe analizar los sistemas legados en Sprint 0 (POC-01, 5 días hábiles).
- **Costo:** Dentro del presupuesto USD 45.000 CAPEX.

### 6. Plan de Reversión

- **Señales de alerta:** POC-01 no encuentra ningún mecanismo de integración viable; el desfase de 24 h genera quejas formales del > 30 % de los docentes.
- **Plan B si POC-01 falla:** Posponer módulos de boletas e información laboral a v1.1. El MVP v1.0 opera sin estas funcionalidades, priorizando DJ y Oferta Académica.
- **Plan B si desfase inaceptable:** Implementar consulta en tiempo real para boletas (aceptando la dependencia del legado) con circuit breaker para proteger el SGAI.

### 7. Validación

- POC-01 confirma al menos 1 mecanismo de integración viable antes de Sprint 1.
- Adaptador de nómina sincroniza ≥ 10 boletas reales en < 5 s en entorno de prueba.
- El modo degradado muestra advertencia visible al usuario con timestamp de última sincronización (verificado en pruebas de usabilidad).
- Responsable: Líder técnico + Unidad de TI. Plazo: Sprint 0.

### 8. Referencias

- ADR-0001 (stack tecnológico que define el patrón de adaptadores).
- POC-01 (resultado pendiente — `docs/pocs/poc-01-integracion-legados/`).
- `docs/skills/integration-mapper.md` (skill para implementación de adaptadores).
- Patrón Adapter (Gang of Four) + Hexagonal Architecture (Cockburn).

### 9. Historial

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| 1 | 10/05/2026 | Carolina Aguilar | Propuesta inicial |
| 2 | 10/05/2026 | Carolina Aguilar | Aceptada; condicionada al resultado de POC-01 |

---

# ADR-0003: Autenticación JWT Stateless con Integración LDAP/AD Institucional

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0003 |
| Título | Autenticación JWT stateless con integración LDAP/AD institucional |
| Fecha | 10/05/2026 |
| Autor(es) | Carolina Aguilar |
| Estado | **Aceptada** |
| Alcance | Módulo M-AUTH; todos los endpoints del sistema |
| Stakeholders consultados | Unidad de TI universitaria, Asesoría Legal (Ley 164) |

### 1. Contexto

El SGAI debe autenticar a 4 tipos de usuarios con las siguientes restricciones: la universidad ya cuenta con un directorio LDAP/AD institucional que gestiona credenciales de toda la comunidad universitaria; no se puede crear un sistema de identidad paralelo (rechazo de Unidad de TI y usuarios); el sistema opera on-premise sin acceso a servicios de identidad cloud sin aprobación; el control de acceso debe ser granular por rol (RBAC); la Ley 164 exige protección de datos de acceso; la regla RB-07 exige bloqueo tras 5 intentos fallidos. Las fuerzas en tensión son: simplicidad de implementación vs. seguridad de revocación; integración con LDAP vs. disponibilidad si LDAP cae; estándar de la industria (OAuth2) vs. complejidad operativa on-premise.

### 2. Alternativas Consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|-------------|------|---------|------------------|
| A. JWT stateless + LDAP bind en login + bcrypt fallback local | Sin servidor de estado adicional; LDAP institucional reutilizado; fallback si LDAP cae; simple de operar on-premise | Revocación de tokens requiere blacklist o esperar expiración (8 h); secreto JWT como punto único de fallo | USD 0 librerías open-source |
| B. Sesiones en servidor (Redis) | Revocación inmediata de sesiones | Requiere Redis como servidor de sesiones (ya requerido para Bull, pero añade responsabilidad); sticky sessions o Redis compartido para escala horizontal | USD 0; ya hay Redis en stack |
| C. OAuth2 / OIDC con Keycloak on-premise | Estándar de la industria; refresh tokens; soporte multi-tenant | Keycloak requiere expertise operativo; añade capa adicional sobre LDAP; complejidad incompatible con Unidad de TI local | +2–4 semanas de implementación |

### 3. Decisión

> **Elegimos la alternativa A: JWT stateless con firma HS256, validación de credenciales contra LDAP/AD en el login, y fallback a bcrypt local si LDAP no está disponible.**

JWT stateless elimina la necesidad de consultar al LDAP en cada request (solo en el login), simplifica la arquitectura on-premise y es operado con facilidad por la Unidad de TI. El rol del usuario se embebe en el JWT y se valida en cada endpoint mediante middleware de Express, implementando RBAC sin estado adicional. El riesgo de revocación (máximo 8 horas) es aceptable para el contexto universitario. El fallback a bcrypt local garantiza disponibilidad si el servidor LDAP no está disponible durante el login.

### 4. Consecuencias

#### 4.1 Positivas
- Los usuarios usan sus credenciales institucionales existentes, sin onboarding adicional.
- JWT stateless elimina la consulta al LDAP en cada request.
- Sin estado de sesión adicional en servidor.
- Simple de implementar y operar on-premise.
- RBAC granular por endpoint protege todas las reglas de negocio (RB-01 a RB-07).

#### 4.2 Negativas / Costos
- Revocación de tokens: si se necesita invalidar un JWT antes de su expiración, se requiere una blacklist en Redis o esperar a que el token expire (máx. 8 h).
- Secreto JWT como punto único de fallo: si se compromete, todos los tokens activos son vulnerables. Mitigado con rotación semestral y almacenamiento en variables de entorno.
- Dependencia del LDAP en el login: si LDAP está caído, el fallback bcrypt requiere que el hash de contraseña esté en la BD local (sincronizado en primer login exitoso).

#### 4.3 Neutras / Observables
- Si la universidad adopta Keycloak o Azure AD institucional en el futuro, la migración desde LDAP directo requiere 1–2 semanas de trabajo.
- El campo `intentos_fallidos` en la tabla `USUARIO` implementa RB-07 sin dependencia de Redis.

### 5. Impacto en el Sistema

- **Código:** `infrastructure/auth/ldap.adapter.ts` + `infrastructure/auth/jwt.service.ts` + middleware `authenticate.middleware.ts` + middleware `requireRole.middleware.ts`.
- **Operaciones:** Variable de entorno `LDAP_URL`, `LDAP_BASE_DN`, `JWT_SECRET` en Docker Compose.
- **Seguridad:** `password` y `password_hash` nunca en logs (Ley 164); error 401 genérico (no revela si falló email o contraseña); bloqueo 15 min tras 5 intentos (RB-07).
- **Equipo:** La Unidad de TI debe confirmar la URL y base DN del servidor LDAP antes de Sprint 1.
- **Costo:** USD 0 librerías (`jsonwebtoken`, `ldapjs`, `bcrypt` — todas open-source).

### 6. Plan de Reversión

- **Señales de alerta:** Ataque de fuerza bruta documentado que elude el bloqueo de cuenta; expiración de 8 h reportada como insuficiente por la Dirección universitaria.
- **Plan B:** Si LDAP no está disponible en go-live, activar `AUTH_MODE=local` (autenticación 100 % bcrypt local) hasta que LDAP esté disponible.
- **Migración a OAuth2:** Si la universidad adopta Keycloak, el adaptador LDAP se reemplaza por un adaptador OIDC sin cambios en el dominio (arquitectura hexagonal).

### 7. Validación

- Test Jest: login exitoso con credenciales válidas retorna JWT con campos `userId`, `rol`, `facultadId`, `exp`.
- Test Jest: 5 intentos fallidos → HTTP 429 con campo `desbloqueo_en` (RB-07).
- Test Jest: JWT con rol `DOCENTE` no puede acceder a endpoints de `ADMIN_FACULTAD`.
- Test Jest: campo `password` nunca aparece en logs (mock de logger verificado).
- Responsable: Carolina Aguilar. Plazo: Sprint 1.

### 8. Referencias

- ADR-0001 (stack tecnológico; define que el auth es parte del monolito, no microservicio separado).
- `AGENTS.md` §4 (guardrails de seguridad y Ley 164).
- OWASP ASVS v4.0 §V2 (Authentication Verification Requirements).
- jsonwebtoken: https://github.com/auth0/node-jsonwebtoken
- ldapjs: https://github.com/ldapjs/node-ldapjs

### 9. Historial

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| 1 | 10/05/2026 | Carolina Aguilar | Propuesta inicial |
| 2 | 10/05/2026 | Carolina Aguilar | Aceptada; fallback bcrypt local añadido como mecanismo de contingencia |

---

# ADR-0004: Despliegue On-Premise con Docker Compose en Servidores Universitarios

### Metadatos

| Campo | Valor |
|-------|-------|
| Número | 0004 |
| Título | Despliegue on-premise con Docker Compose en servidores universitarios Ubuntu 22.04 LTS |
| Fecha | 10/05/2026 |
| Autor(es) | Carolina Aguilar |
| Estado | **Aceptada** |
| Alcance | Infraestructura de despliegue — entornos staging y production |
| Stakeholders consultados | Unidad de TI universitaria |

### 1. Contexto

La universidad tiene una política institucional que exige que los sistemas universitarios operen en servidores locales de la Unidad de TI (RES-02 del BRD). No se puede usar infraestructura cloud pública (AWS, GCP, Azure) sin aprobación explícita de la Unidad de TI. Los servidores disponibles ejecutan Ubuntu 22.04 LTS. La Unidad de TI tiene conocimientos técnicos estándar (Linux, Docker básico) pero sin expertise en Kubernetes, service mesh ni plataformas cloud. El presupuesto excluye licencias de plataformas de orquestación empresariales. Las fuerzas en tensión son: portabilidad (Docker) vs. orquestación avanzada (Kubernetes); costo operativo bajo vs. capacidades de escalado; cumplimiento Ley 164 (datos en servidores locales) vs. elasticidad cloud.

### 2. Alternativas Consideradas

| Alternativa | Pros | Contras | Costo aproximado |
|-------------|------|---------|------------------|
| A. Docker Compose on-premise (Ubuntu 22.04 LTS) | Operable por Unidad de TI sin expertise avanzado; cero licencias; reproducible dev = staging = prod; portable; `docker-compose up` como rollback | Escala vertical, no horizontal; sin self-healing automático si un contenedor cae | USD 0 licencias |
| B. Kubernetes on-premise (K3s o microk8s) | Self-healing; escala horizontal; estándar de la industria | Curva de aprendizaje alta para Unidad de TI; overhead operativo incompatible con equipo de 1–2 personas TI | USD 0 licencias; +3–4 semanas de configuración |
| C. Cloud pública (AWS ECS + RDS) | Escalabilidad elástica; managed services; alta disponibilidad | Violación de RES-02 (datos en nube sin aprobación); costo USD 300–600/mes; datos docentes fuera de Bolivia (potencial Ley 164) | USD 3.600–7.200/año |

### 3. Decisión

> **Elegimos la alternativa A: Docker Compose en servidores Ubuntu 22.04 LTS de la Unidad de TI universitaria.**

Docker Compose es la única alternativa que combina la operabilidad requerida por la Unidad de TI local, cumplimiento de RES-02 (datos on-premise), Ley 164 (datos en Bolivia) y costo cero de licencias. Para el volumen proyectado (≤ 200 usuarios concurrentes, 1.500 docentes con uso distribuido en el día), un único servidor bien dimensionado con Docker Compose es suficiente. El rollback es tan simple como `docker-compose down && docker-compose up <imagen_anterior>`.

### 4. Consecuencias

#### 4.1 Positivas
- Operable por Unidad de TI sin conocimientos avanzados.
- Reproducibilidad perfecta entre entornos (dev = staging = production).
- Rollback en < 15 minutos.
- Datos docentes y financieros permanecen on-premise (cumplimiento Ley 164).
- Costo operativo: USD 6.000/año (hardware + administración TI).

#### 4.2 Negativas / Costos
- Sin self-healing automático: si un contenedor cae, la Unidad de TI debe reiniciarlo manualmente (o configurar `restart: always` en Docker Compose).
- Escala vertical únicamente: si el volumen crece significativamente, se requiere hardware más potente.
- Sin load balancing entre instancias del API en v1.0.

#### 4.3 Neutras / Observables
- El archivo `docker-compose.yml` es la fuente de verdad del despliegue; debe versionarse junto al código.
- Los logs de los contenedores deben configurarse con `max-size` y `max-file` para evitar que llenen el disco del servidor.

### 5. Impacto en el Sistema

- **Código:** `docker-compose.yml` + `docker-compose.staging.yml` + `Dockerfile` para API, Worker y Scheduler.
- **Operaciones:** La Unidad de TI recibe documentación de operación básica: `docker-compose up -d`, `docker-compose logs -f api`, procedimiento de backup, procedimiento de rollback.
- **Seguridad:** Las variables de entorno (secretos) se gestionan en archivos `.env` en el servidor; nunca se commitean al repositorio.
- **Equipo:** La Unidad de TI necesita capacitación básica de Docker (estimado: 4 horas).
- **Costo:** USD 0 de licencias adicionales; dentro del presupuesto OPEX de USD 6.000/año.

### 6. Plan de Reversión

- **Señales de alerta:** Usuarios concurrentes > 500 sostenidos con degradación de performance; más de 3 incidentes de contenedor caído por semana.
- **Costo de revertir:** Migración a K3s (Kubernetes ligero): 3–4 semanas de trabajo. La aplicación ya está en contenedores, solo cambia el orquestador.
- **Plan B:** Si el servidor se queda sin recursos, escala vertical (más RAM/CPU) antes que cambiar el orquestador.

### 7. Validación

- `docker-compose up` en entorno de staging levanta el sistema completo en < 5 minutos.
- Todos los NFRs (especialmente NFR-001 p95 < 2 s y NFR-008 ≥ 200 VUs) se verifican en el entorno Docker Compose de staging con k6.
- La Unidad de TI confirma que puede operar el sistema siguiendo el runbook de operaciones.
- Responsable: Carolina Aguilar + Unidad de TI. Plazo: antes del go-live v1.0.

### 8. Referencias

- ADR-0001 (stack tecnológico que define los contenedores necesarios).
- Docker Compose v2: https://docs.docker.com/compose/
- Ley N° 164 Bolivia (soberanía de datos).
- Política institucional de la Unidad de TI (RES-02 del BRD_v2.md §13).

### 9. Historial

| Versión | Fecha | Autor | Cambio |
|---------|-------|-------|--------|
| 1 | 10/05/2026 | Carolina Aguilar | Propuesta inicial |
| 2 | 10/05/2026 | Carolina Aguilar | Aceptada tras confirmar RES-02 con la Unidad de TI |
