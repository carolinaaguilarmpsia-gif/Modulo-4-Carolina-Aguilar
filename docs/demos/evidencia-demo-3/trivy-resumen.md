# Trivy sobre la imagen sgai-backend (solo HIGH y CRITICAL)

## ANTES de actualizar dependencias: 45 hallazgos

| Tipo | Paquete | Instalada | CVE | Sev. | Corregida en | Estado |
|---|---|---|---|---|---|---|
| debian | bsdutils | 1:2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | bsdutils | 1:2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | bsdutils | 1:2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | gzip | 1.12-1 | CVE-2026-41992 | HIGH | - | fix_deferred |
| debian | libacl1 | 2.3.1-3 | CVE-2026-54369 | HIGH | - | fix_deferred |
| debian | libblkid1 | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | libblkid1 | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | libblkid1 | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | libmount1 | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | libmount1 | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | libmount1 | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | libsmartcols1 | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | libsmartcols1 | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | libsmartcols1 | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | libsystemd0 | 252.39-1~deb12u2 | CVE-2026-16742 | HIGH | - | fix_deferred |
| debian | libtinfo6 | 6.4-4 | CVE-2025-69720 | HIGH | - | affected |
| debian | libudev1 | 252.39-1~deb12u2 | CVE-2026-16742 | HIGH | - | fix_deferred |
| debian | libuuid1 | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | libuuid1 | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | libuuid1 | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | mount | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | mount | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | mount | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | ncurses-base | 6.4-4 | CVE-2025-69720 | HIGH | - | affected |
| debian | ncurses-bin | 6.4-4 | CVE-2025-69720 | HIGH | - | affected |
| debian | perl-base | 5.36.0-7+deb12u4 | CVE-2026-9538 | HIGH | - | fix_deferred |
| debian | util-linux | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | util-linux | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | util-linux | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | util-linux-extra | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | util-linux-extra | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | util-linux-extra | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | zlib1g | 1:1.2.13.dfsg-1 | CVE-2023-45853 | CRITICAL | - | will_not_fix |
| node-pkg | @modelcontextprotocol/sdk | 1.30.0 | CVE-2026-104850 | HIGH | 1.31.0 | fixed |
| node-pkg | @modelcontextprotocol/sdk | 1.30.0 | CVE-2026-111767 | HIGH | 1.32.0 | fixed |
| node-pkg | @modelcontextprotocol/sdk | 1.30.0 | CVE-2026-111768 | HIGH | 1.32.0 | fixed |
| node-pkg | @modelcontextprotocol/sdk | 1.30.0 | GHSA-f897-62hf-6gxq | HIGH | 1.30.1 | fixed |
| node-pkg | body-parser | 1.20.6 | CVE-2026-111181 | HIGH | 2.4.0, 1.20.9 | fixed |
| node-pkg | body-parser | 2.3.0 | CVE-2026-111181 | HIGH | 2.4.0, 1.20.9 | fixed |
| node-pkg | fast-uri | 3.1.5 | CVE-2026-75899 | HIGH | 2.4.5, 3.1.6, 4.1.3 | fixed |
| node-pkg | fast-uri | 3.1.5 | CVE-2026-75931 | HIGH | 2.4.5, 3.1.6, 4.1.3 | fixed |
| node-pkg | fast-uri | 3.1.5 | CVE-2026-75975 | HIGH | 2.4.5, 3.1.6, 4.1.3 | fixed |
| node-pkg | fast-uri | 3.1.5 | CVE-2026-76172 | HIGH | 2.4.5, 3.1.6, 4.1.3 | fixed |
| node-pkg | fast-uri | 3.1.5 | CVE-2026-84292 | HIGH | 2.4.6, 3.1.7, 4.1.4 | fixed |
| node-pkg | proxy-addr | 2.0.7 | CVE-2026-90711 | CRITICAL | 2.0.8 | fixed |

## DESPUES (imagen entregada): 33 hallazgos

| Tipo | Paquete | Instalada | CVE | Sev. | Corregida en | Estado |
|---|---|---|---|---|---|---|
| debian | bsdutils | 1:2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | bsdutils | 1:2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | bsdutils | 1:2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | gzip | 1.12-1 | CVE-2026-41992 | HIGH | - | fix_deferred |
| debian | libacl1 | 2.3.1-3 | CVE-2026-54369 | HIGH | - | fix_deferred |
| debian | libblkid1 | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | libblkid1 | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | libblkid1 | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | libmount1 | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | libmount1 | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | libmount1 | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | libsmartcols1 | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | libsmartcols1 | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | libsmartcols1 | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | libsystemd0 | 252.39-1~deb12u2 | CVE-2026-16742 | HIGH | - | fix_deferred |
| debian | libtinfo6 | 6.4-4 | CVE-2025-69720 | HIGH | - | affected |
| debian | libudev1 | 252.39-1~deb12u2 | CVE-2026-16742 | HIGH | - | fix_deferred |
| debian | libuuid1 | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | libuuid1 | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | libuuid1 | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | mount | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | mount | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | mount | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | ncurses-base | 6.4-4 | CVE-2025-69720 | HIGH | - | affected |
| debian | ncurses-bin | 6.4-4 | CVE-2025-69720 | HIGH | - | affected |
| debian | perl-base | 5.36.0-7+deb12u4 | CVE-2026-9538 | HIGH | - | fix_deferred |
| debian | util-linux | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | util-linux | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | util-linux | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | util-linux-extra | 2.38.1-5+deb12u3 | CVE-2026-53613 | HIGH | - | affected |
| debian | util-linux-extra | 2.38.1-5+deb12u3 | CVE-2026-53615 | HIGH | - | affected |
| debian | util-linux-extra | 2.38.1-5+deb12u3 | CVE-2026-78410 | HIGH | - | affected |
| debian | zlib1g | 1:1.2.13.dfsg-1 | CVE-2023-45853 | CRITICAL | - | will_not_fix |
