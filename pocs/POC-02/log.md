# POC-02 — Log

| Timestamp | Comando | Resultado |
|-----------|---------|-----------|
| 2026-05-17T10:05:00-04:00 | `./scripts/verify-poc.sh` | **pass** — orphan=0, p95_ms=420 |

## Lecciones aprendidas

1. RB-06 MUST usar una sola `$transaction`; encolar Bull solo post-commit.
2. Sizing ECS (ADR-0005): p95 420 ms deja margen para NFR-001 bajo 2 s con red.
3. Índice único `(dj_id, estado)` no sustituye la transacción — solo complementa.

## Impacto

- ADR-0001 confirmada; ADR-0006 no requiere saga para DJ.
- DTI §12.2 — **pass**
