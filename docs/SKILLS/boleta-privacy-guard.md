# Skill: Boleta Privacy Guard — Acceso Financiero Ley 164

> **Cuándo usar:** Al implementar consulta/descarga de boletas, sync desde nómina, PDF de boletas o tests de autorización financiera.

---

## Identidad

```yaml
skill_id: boleta-privacy-guard
versión: v1.0
dominio: informacion-financiera
bounded_context: backend/domain/informacion-financiera/
casos_uso: FSD-UC-005
reglas: [RB-04, RB-06 en BRD]
prompt_contract: PR-FSD-UC-005
diagrama: docs/DIAGRAMS/seq_uc005_boleta_consulta.mmd
```

---

## Procedimiento de ejecución

1. Leer `PR-FSD-UC-005` y skill `integration-mapper` si toca sync de nómina.
2. **Extraer `docenteId` exclusivamente de `req.user.userId` (JWT)** — ignorar query/body.
3. Llamar `assertOwnData(req, docenteId, correlationId)` como primera línea del controller.
4. Repository: `WHERE docente_id = :docenteId` con `select` acotado.
5. Respuesta: incluir `sincronizado_at`; banner si datos > 24 h.
6. PDF: generar stream sin loggear montos; auditar acceso con `logSensitiveAccess`.
7. Test obligatorio: Admin.Facultad intenta GET boletas ajenas → 403.

---

## MUST

```
MUST comparar docente_id JWT === docente_id boleta (RB-04)
MUST registrar log de auditoría READ (resourceId, periodo — sin montos)
MUST cifrar o marcar PII financiero en reposo (NFR-004)
MUST modo degradado: últimos datos cacheados + advertencia si sync falla
```

## MUST NOT

```
MUST NOT aceptar docenteId en URL o query para filtrar boletas
MUST NOT loggear haber_basico, descuentos, neto, ci
MUST NOT exponer boletas en reportes DPA agregados (skill offer/reportes)
```

---

## Checklist de salida

- [ ] Controller sin `req.params.docenteId` para autorización
- [ ] Test 403 para rol no-DOCENTE o docente ajeno
- [ ] `logSensitiveAccess` en GET y descarga PDF
- [ ] Respuesta de error 500 solo con `correlationId`
