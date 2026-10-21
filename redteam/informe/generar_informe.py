#!/usr/bin/env python3
"""
Regenera el informe de Word del red team con el estilo de M6_Documento_Final.

1. pandoc une README.md + MODELO_DE_AMENAZAS.md + los 4 hallazgos (hallazgos/AI-SEC-*.md) en un .docx.
2. Este script le aplica el estilo de M6: portada UMSS, Calibri, títulos celestes,
   tablas con encabezado azul marino, bloques de código oscuros, A4 con márgenes de 2,5 cm.

Uso (desde la raíz del repo):  python3 redteam/informe/generar_informe.py
Salida: docs/entrega-ia/Informe_RedTeaming_SGAI_estilo_M6.docx
"""
import re
import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
FUENTES = [
    'redteam/README.md',
    'redteam/MODELO_DE_AMENAZAS.md',
    'redteam/hallazgos/AI-SEC-001.md',
    'redteam/hallazgos/AI-SEC-004.md',
    'redteam/hallazgos/AI-SEC-005.md',
    'redteam/hallazgos/AI-SEC-007.md',
]
SALIDA = RAIZ / 'docs/entrega-ia/Informe_RedTeaming_SGAI_estilo_M6.docx'

ANCHO = 9026  # ancho útil A4 con márgenes de 1440
# Proporción de columnas por tabla, según el texto de la primera celda del encabezado.
ANCHOS = {
    'Entregable': [30, 70],
    'Archivo': [21, 31, 17, 13, 18],
    'Elemento': [16, 17, 67],
    'Campo': [20, 80],
    'ID': [26, 16, 58],
}
PORTADA = [
    ('Campo', 'Valor'),
    ('Equipo', 'Grupo G01'),
    ('Integrantes', 'Carolina Aguilar'),
    ('Módulo', 'M7 — Tarea: Red Teaming sobre su proyecto'),
    ('Docente', '[COMPLETAR: docente del módulo]'),
    ('Repositorio', 'https://github.com/carolinaaguilarmpsia-gif/Modulo-6-Carolina-Aguilar/tree/agent-mcp'),
    ('Fecha', '23/09/2026'),
]
RESUMEN = ('Red teaming controlado sobre la capa de IA de SGAI (orquestador de atención, agente de Declaraciones '
           'Juradas con MCP y asistente de trámites): modelo de amenazas, ataques en JSON ejecutados tres veces, '
           'hallazgo AI-SEC-001, mitigación en código, retest y test de regresión.')

BORDES = ''.join(f'<w:{x} w:val="single" w:sz="4" w:color="auto" />' for x in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'])
CALIBRI = '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri" />'


def sz(n):
    return f'<w:sz w:val="{n}" /><w:szCs w:val="{n}" />'


def estilos(st):
    # Fuente base Calibri 11, idioma español
    st = re.sub(r'<w:rFonts w:asciiTheme="minorHAnsi"[^>]*/>\s*<w:sz w:val="24" />\s*<w:szCs w:val="24" />',
                '<w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri" w:eastAsia="Calibri" />' + sz(22), st, count=1)
    st = re.sub(r'<w:lang [^>]*/>', '<w:lang w:val="es-BO" />', st, count=1)
    # Cuerpo alineado a la izquierda, interlineado 1.15
    st = st.replace('<w:spacing w:after="180" w:before="180" />',
                    '<w:spacing w:after="120" w:before="0" w:line="276" w:lineRule="auto" />', 1)
    # Celdas (estilo Compact) sin espaciado extra
    st = st.replace('<w:spacing w:after="36" w:before="36" />', '<w:spacing w:after="20" w:before="20" /><w:jc w:val="left" />', 1)

    def restyle(sid, ppr, rpr):
        nonlocal st
        m = re.search(r'<w:style [^>]*w:styleId="%s".*?</w:style>' % sid, st, re.S)
        if not m:
            return
        blk = m.group(0)
        nuevo = re.sub(r'<w:pPr>.*?</w:pPr>', '<w:pPr>' + ppr + '</w:pPr>', blk, count=1, flags=re.S) if ppr else blk
        nuevo = re.sub(r'<w:rPr>.*?</w:rPr>', '<w:rPr>' + rpr + '</w:rPr>', nuevo, count=1, flags=re.S)
        st = st.replace(blk, nuevo)

    # Títulos como M6: celestes, sin negrita
    restyle('Heading1', '<w:keepNext /><w:keepLines /><w:spacing w:before="360" w:after="120" /><w:outlineLvl w:val="0" />',
            CALIBRI + '<w:color w:val="2E74B5" />' + sz(32))
    restyle('Heading2', '<w:keepNext /><w:keepLines /><w:spacing w:before="240" w:after="100" /><w:outlineLvl w:val="1" />',
            CALIBRI + '<w:color w:val="2E74B5" />' + sz(26))
    restyle('Heading3', '<w:keepNext /><w:keepLines /><w:spacing w:before="200" w:after="100" /><w:outlineLvl w:val="2" />',
            CALIBRI + '<w:color w:val="1F4D78" />' + sz(24))
    # Código inline más chico
    st = re.sub(r'(<w:style [^>]*w:styleId="VerbatimChar".*?<w:sz w:val=")\d+(" />)', r'\g<1>18\2', st, count=1, flags=re.S)
    # Tablas: encabezado azul marino con texto blanco, bordes simples, texto 10 pt
    tabla = ('<w:style w:default="1" w:styleId="Table" w:type="table"><w:name w:val="Table" /><w:basedOn w:val="TableNormal" /><w:qFormat />'
             '<w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto" /></w:pPr>'
             '<w:rPr><w:color w:val="1E293B" />' + sz(20) + '</w:rPr>'
             '<w:tblPr><w:tblInd w:type="dxa" w:w="0" /><w:tblBorders>' + BORDES + '</w:tblBorders>'
             '<w:tblCellMar><w:top w:type="dxa" w:w="80" /><w:left w:type="dxa" w:w="100" /><w:bottom w:type="dxa" w:w="80" /><w:right w:type="dxa" w:w="100" /></w:tblCellMar></w:tblPr>'
             '<w:tblStylePr w:type="firstRow"><w:rPr><w:b /><w:bCs /><w:color w:val="FFFFFF" /></w:rPr>'
             '<w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="1E3A5F" /></w:tcPr></w:tblStylePr></w:style>')
    st = re.sub(r'<w:style w:default="1" w:styleId="Table" w:type="table">.*?</w:style>', lambda _: tabla, st, count=1, flags=re.S)
    return st


def ajustar_tabla(m):
    t = m.group(0)
    primera = re.sub(r'<[^>]+>', '', re.search(r'<w:tr>.*?</w:tr>', t, re.S).group(0))
    clave = next((k for k in ANCHOS if primera.startswith(k)), None)
    n = len(re.findall(r'<w:gridCol ', t))
    proporciones = ANCHOS[clave] if clave and len(ANCHOS[clave]) == n else [100 / n] * n
    cols = [round(ANCHO * p / 100) for p in proporciones]
    t = re.sub(r'<w:tblGrid>.*?</w:tblGrid>', '<w:tblGrid>' + ''.join(f'<w:gridCol w:w="{c}" />' for c in cols) + '</w:tblGrid>', t, count=1, flags=re.S)
    t = re.sub(r'<w:tblW [^>]*/>', f'<w:tblW w:type="dxa" w:w="{ANCHO}" />', t, count=1)
    t = re.sub(r'<w:tblLayout [^>]*/>', '<w:tblLayout w:type="fixed" />', t, count=1)
    t = t.replace('<w:tcPr />', '')

    def fila(fm):
        i = [0]

        def celda(cm):
            w = cols[min(i[0], len(cols) - 1)]
            i[0] += 1
            c = cm.group(0)
            if '<w:tcPr>' in c:
                return c.replace('<w:tcPr>', f'<w:tcPr><w:tcW w:w="{w}" w:type="dxa" />', 1)
            return c.replace('<w:tc>', f'<w:tc><w:tcPr><w:tcW w:w="{w}" w:type="dxa" /></w:tcPr>', 1)
        return re.sub(r'<w:tc>.*?</w:tc>', celda, fm.group(0), flags=re.S)
    return re.sub(r'<w:tr>.*?</w:tr>', fila, t, flags=re.S)


def bloque_codigo(m):
    p = m.group(0).replace('<w:pStyle w:val="SourceCode" />',
                           '<w:pStyle w:val="SourceCode" /><w:shd w:val="clear" w:color="auto" w:fill="0F172A" />', 1)
    return re.sub(r'<w:rStyle w:val="\w+" />', '<w:rStyle w:val="VerbatimChar" /><w:color w:val="E2E8F0" />' + sz(18), p)


def portada():
    def par(txt, rpr, after, before=None):
        sp = f'<w:spacing w:after="{after}"' + (f' w:before="{before}"' if before else '') + ' />'
        return f'<w:p><w:pPr>{sp}</w:pPr><w:r><w:rPr>{rpr}</w:rPr><w:t xml:space="preserve">{txt}</w:t></w:r></w:p>'

    def celda(txt, w, cabecera):
        shd = '<w:shd w:val="clear" w:color="auto" w:fill="1E3A5F" />' if cabecera else ''
        rpr = ('<w:b /><w:bCs /><w:color w:val="FFFFFF" />' if cabecera else '<w:color w:val="1E293B" />') + sz(20)
        return (f'<w:tc><w:tcPr><w:tcW w:w="{w}" w:type="dxa" />{shd}</w:tcPr>'
                '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto" /></w:pPr>'
                f'<w:r><w:rPr>{rpr}</w:rPr><w:t xml:space="preserve">{txt}</w:t></w:r></w:p></w:tc>')
    tabla = ('<w:tbl><w:tblPr><w:tblW w:type="dxa" w:w="9200" /><w:tblBorders>' + BORDES + '</w:tblBorders>'
             '<w:tblCellMar><w:top w:type="dxa" w:w="80" /><w:left w:type="dxa" w:w="100" /><w:bottom w:type="dxa" w:w="80" /><w:right w:type="dxa" w:w="100" /></w:tblCellMar></w:tblPr>'
             '<w:tblGrid><w:gridCol w:w="2400" /><w:gridCol w:w="6800" /></w:tblGrid>'
             + ''.join('<w:tr>' + celda(a, 2400, i == 0) + celda(b, 6800, i == 0) + '</w:tr>' for i, (a, b) in enumerate(PORTADA))
             + '</w:tbl>')
    return (par('UNIVERSIDAD MAYOR DE SAN SIMÓN', '<w:b /><w:bCs /><w:color w:val="1E3A5F" />' + sz(22), 40)
            + par('Facultad de Ciencias y Tecnología · Dirección de Posgrado', '<w:color w:val="475569" />' + sz(20), 40)
            + par('Maestría en Desarrollo de Productos de Software con Inteligencia Artificial', '<w:color w:val="475569" />' + sz(20), 300)
            + par('INFORME DE AVANCE — RED TEAMING', '<w:b /><w:bCs />' + sz(24), 60, 200)
            + par('SGAI — Sistema de Gestión Académica con IA', '<w:b /><w:bCs /><w:color w:val="1E3A5F" />' + sz(32), 40)
            + par(RESUMEN, '<w:i /><w:iCs />' + sz(21), 400)
            + tabla + '<w:p><w:r><w:br w:type="page" /></w:r></w:p>')


def documento(d):
    d = re.sub(r'<w:tbl>.*?</w:tbl>', ajustar_tabla, d, flags=re.S)
    d = re.sub(r'<w:p>(?:(?!</w:p>).)*?<w:pStyle w:val="SourceCode" />.*?</w:p>', bloque_codigo, d, flags=re.S)
    # A4, márgenes de 2,5 cm (van después de footnotePr dentro de sectPr)
    d = re.sub(r'<w:pgSz [^>]*/>|<w:pgMar [^>]*/>', '', d)
    d = re.sub(r'</w:sectPr>', '<w:pgSz w:w="11906" w:h="16838" /><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" '
               'w:left="1440" w:header="708" w:footer="708" w:gutter="0" /></w:sectPr>', d)
    return d.replace('<w:body>', '<w:body>' + portada(), 1)


def main():
    with tempfile.TemporaryDirectory() as tmp:
        base = Path(tmp) / 'base.docx'
        subprocess.run(['pandoc', *FUENTES, '-o', str(base)], cwd=RAIZ, check=True)
        with zipfile.ZipFile(base) as z:
            archivos = {n: z.read(n) for n in z.namelist()}
        archivos['word/styles.xml'] = estilos(archivos['word/styles.xml'].decode()).encode()
        archivos['word/document.xml'] = documento(archivos['word/document.xml'].decode()).encode()
        salida_tmp = Path(tmp) / 'salida.docx'
        with zipfile.ZipFile(salida_tmp, 'w', zipfile.ZIP_DEFLATED) as z:
            for nombre, datos in archivos.items():
                z.writestr(nombre, datos)
        SALIDA.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(salida_tmp, SALIDA)
    print(f'Informe generado: {SALIDA.relative_to(RAIZ)}')


if __name__ == '__main__':
    main()
