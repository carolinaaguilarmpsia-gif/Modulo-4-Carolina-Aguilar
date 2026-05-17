# Skill: NFR Compliance — Verificador de Requisitos No Funcionales

> **Cuándo usar:** Al generar código de infraestructura, middlewares, queries de BD o al revisar PR. Verifica que el código generado cumple los NFRs del FSD_v1.1.md §10.

---

## Identidad

```yaml
skill_id: nfr-compliance
versión: v1.0
referencia: FSD_v1.1.md §10
norma: ISO/IEC 25010
```

---

## NFRs del SGAI — Tabla de Referencia Completa

| ID | Categoría ISO 25010 | Requisito | Métrica | Umbral | Cómo verificar |
|----|---------------------|-----------|---------|--------|----------------|
| NFR-001 | Eficiencia de rendimiento — Comportamiento temporal | Latencia operaciones CRUD principales | p95 | < 2 s | k6 load test en staging |
| NFR-002 | Eficiencia de rendimiento — Comportamiento temporal | Generación de reportes PDF/Excel | tiempo máximo | < 10 s | Test funcional automatizado (Jest) |
| NFR-003 | Fiabilidad — Disponibilidad | Uptime en horario hábil 7:00–22:00 | uptime mensual | ≥ 99 % | Uptime Robot + alertas |
| NFR-004 | Seguridad — Confidencialidad | Cifrado de datos en reposo (PII, financiero) | estándar | AES-256 | Auditoría de configuración PostgreSQL |
| NFR-005 | Seguridad — Integridad | Cifrado de datos en tránsito | protocolo | TLS 1.2+ | SSL Labs scan en staging |
| NFR-006 | Seguridad — Autenticidad | Expiración de sesión por inactividad | tiempo | ≤ 8 horas | Test automatizado Jest (mock timer) |
| NFR-007 | Seguridad — Cumplimiento | Protección de datos — Ley 164 Bolivia | aplicable | 100 % | Revisión legal + auditoría OWASP |
| NFR-008 | Eficiencia de rendimiento — Utilización de recursos | Usuarios concurrentes soportados | número | ≥ 200 simultáneos | k6 stress test (200 VUs, 10 min) |
| NFR-009 | Mantenibilidad — Analizabilidad | Trazabilidad de requests con correlationId | % de requests | 100 % | Revisión de logs en staging |
| NFR-010 | Mantenibilidad — Testeabilidad | Cobertura de tests en módulos de dominio | % líneas | ≥ 80 % | `jest --coverage` en CI (falla si < 80 %) |

---

## MUST — Checklist de Cumplimiento por Capa

### Backend — Express Middleware

```
MUST incluir middleware de correlationId en TODOS los requests (NFR-009)
MUST incluir middleware de rate limiting en endpoints de login (RB-07 / NFR-007)
MUST incluir timeout de 30 s en llamadas a sistemas legados (NFR-001 en modo degradado)
MUST incluir helmet() para headers de seguridad HTTP (NFR-007)
```

### Prisma — Queries

```
MUST usar select específico — NUNCA findMany() sin select ni where (NFR-001)
MUST usar transacciones atómicas para cambios de estado + historial (RB-06)
MUST agregar índices en campos de búsqueda frecuente: docente_id, facultad_id, estado, periodo (NFR-001)
MUST NO usar N+1 queries — verificar en code review con explain analyze si duda
```

### Generación de Reportes

```
MUST usar streams para PDF/Excel si el dataset > 1.000 filas (NFR-002)
MUST limitar reportes a 12 meses máximo por request (NFR-001 + NFR-002)
MUST encolar la generación de reportes grandes (> 500 filas) en Bull (NFR-002)
```

---

## Patrón de Implementación del correlationId (NFR-009)

```typescript
// infrastructure/middleware/correlationId.middleware.ts
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const correlationId = (req.headers['x-correlation-id'] as string) ?? uuidv4();
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}

// Uso en todo logger:
logger.info('Action executed', {
  correlationId: req.correlationId, // OBLIGATORIO
  userId: req.user?.userId,
  action: 'DJ_STATE_TRANSITION',
  module: 'declaracion-jurada'
});
```

---

## Script de Verificación k6 — Template NFR-001/NFR-008

```javascript
// docs/tests/k6/nfr-crud-latency.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 200,           // NFR-008: 200 usuarios concurrentes
  duration: '10m',
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // NFR-001: p95 < 2s
    http_req_failed: ['rate<0.01'],     // < 1% error rate
  },
};

export default function () {
  const res = http.get(`${__ENV.API_URL}/declaraciones-juradas`, {
    headers: { Authorization: `Bearer ${__ENV.JWT_TOKEN}` },
  });
  check(res, { 'status 200': (r) => r.status === 200 });
}
```
