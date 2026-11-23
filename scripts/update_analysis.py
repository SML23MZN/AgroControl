from pathlib import Path
from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor
from docx.text.paragraph import Paragraph

root = Path(__file__).resolve().parents[1]
source = Path(r'C:\Users\SAMUEL PALACIO\Downloads\AgroControl_Analisis (1).docx')
output = root / 'docs' / 'AgroControl_Analisis_Actualizado.docx'
doc = Document(source)

def bullet(text):
    paragraph = doc.add_paragraph()
    paragraph.paragraph_format.left_indent = Pt(18)
    paragraph.paragraph_format.first_line_indent = Pt(-12)
    paragraph.add_run('•  ' + text)
    return paragraph

# Actualiza el caso de uso del dashboard para que coincida con el prototipo.
for table in doc.tables:
    first_row = ' '.join(cell.text for cell in table.rows[0].cells)
    if 'CU16' not in first_row or 'dashboard' not in first_row.lower():
        continue
    updates = {
        'Descripción': 'El usuario consulta un panel individual por finca con indicadores operativos, productivos y económicos, además de un resumen por cultivo y actividad reciente.',
        'Flujo principal': '1. El usuario inicia sesión y abre Resumen. / 2. El sistema identifica las fincas autorizadas para su cuenta. / 3. Consulta fincas activas, lotes, actividades pendientes, ciclos activos, trabajadores, cosechas, producción, ingresos y gastos. / 4. Presenta la producción por cultivo y el resumen económico por finca. / 5. Muestra las actividades recientes. / 6. El usuario navega al módulo relacionado para revisar o actualizar la información.',
        'Postcondición': 'El usuario visualiza indicadores calculados con los registros disponibles y el alcance de sus permisos por finca.',
        'Flujo alternativo': 'Si no hay registros, el sistema comunica que aún no hay datos. Si la API o la base de datos no están disponibles, muestra un estado sin información (—) y un mensaje de error, sin presentar un fallo de conexión como si fuera un valor cero.',
    }
    for row in table.rows:
        key = row.cells[0].text.strip().split('\n')[0]
        if key in updates:
            row.cells[1].text = updates[key]
    break

# Conserva el análisis fuente y anexa las decisiones tomadas en el prototipo.
for paragraph in doc.paragraphs:
    if paragraph.text.strip() == 'Noviembre, 2026':
        paragraph.text = 'Noviembre, 2026 · Versión actualizada del prototipo'
        break
toc = next((p for p in doc.paragraphs if p.text.strip().startswith('10.3. Especificación detallada')), None)
if toc:
    paragraph_xml = OxmlElement('w:p')
    toc._p.addnext(paragraph_xml)
    Paragraph(paragraph_xml, toc._parent).add_run('XI. Actualización del prototipo y alcance')

doc.add_page_break()
doc.add_heading('XI. Actualización del prototipo y alcance', level=1)
doc.add_paragraph('Esta sección complementa el análisis inicial y describe el alcance visible en el prototipo AgroControl actualizado para la presentación universitaria. Los requisitos originales y los casos de uso CU01–CU19 se conservan como base; los puntos siguientes precisan su aplicación y los cambios incorporados.')

doc.add_heading('11.1 Enfoque regional y administración por finca', level=2)
for text in [
    'La solución se orienta a unidades productivas del Urabá antioqueño y contempla banano, plátano y banano manzano, con variedades locales registrables.',
    'Cada finca conserva sus propios lotes, ciclos, trabajadores, actividades, cosechas, compradores, ventas y gastos. El dashboard presenta resultados por finca; se retiró la comparación estadística regional para evitar mezclar registros de unidades productivas distintas.',
    'La ubicación se captura como municipio y vereda en el registro individual de la finca. El catálogo permite registrar otros cultivos cuando la operación lo requiera.',
]:
    bullet(text)

doc.add_heading('11.2 Dashboard e indicadores', level=2)
doc.add_paragraph('El panel principal consolidado muestra fincas y lotes activos, actividades pendientes, ciclos activos, trabajadores, cosechas y producción total. Presenta además ingresos por ventas, gastos de producción, resultado neto, producción por cultivo, indicadores individuales por finca y las últimas actividades registradas. El módulo de reportes conserva el resumen histórico por finca y agrega un detalle de ventas que se puede filtrar por fecha inicial, fecha final, cultivo y comprador.')
table = doc.add_table(rows=1, cols=2)
table.rows[0].cells[0].text = 'Indicador'
table.rows[0].cells[1].text = 'Fuente de cálculo'
for cell in table.rows[0].cells:
    for run in cell.paragraphs[0].runs:
        run.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(10)
    shade = OxmlElement('w:shd')
    shade.set(qn('w:fill'), '174D39')
    cell._tc.get_or_add_tcPr().append(shade)
border_group = OxmlElement('w:tblBorders')
for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
    border = OxmlElement('w:' + edge)
    border.set(qn('w:val'), 'single')
    border.set(qn('w:sz'), '5')
    border.set(qn('w:color'), 'D6E0D8')
    border_group.append(border)
table._tbl.tblPr.append(border_group)
for left, right in [
    ('Producción', 'Suma de cantidades registradas en cosechas; las unidades se conservan en el detalle y el conjunto académico usa kg.'),
    ('Ingresos', 'Suma del total de ventas registradas.'),
    ('Gastos', 'Suma de gastos registrados por finca.'),
    ('Resultado neto estimado', 'Ingresos acumulados menos gastos capturados; no sustituye una contabilidad formal.'),
    ('Producción por cultivo y finca', 'Agrupación de cosechas según cultivo y finca relacionada.'),
]:
    cells = table.add_row().cells
    cells[0].text, cells[1].text = left, right

doc.add_heading('11.3 Interfaz y experiencia de uso', level=2)
for text in [
    'El sistema ofrece modo claro y oscuro, tipografía ampliada y ajustes para pantallas de computador y dispositivos móviles.',
    'El menú lateral tiene desplazamiento propio para mantener accesibles todos los módulos y una separación mayor entre las opciones.',
    'La pantalla de inicio de sesión usa una tarjeta de acceso y una presentación regional coherente con la identidad de AgroControl.',
    'La barra superior presenta hora y fecha de Colombia y el clima actual de referencia para Urabá. El clima usa coordenadas de referencia regionales y una consulta a Open-Meteo; requiere conexión a internet y no constituye una medición de la finca seleccionada.',
]:
    bullet(text)

doc.add_heading('11.4 Datos académicos de presentación', level=2)
doc.add_paragraph('El prototipo incluye un cargador idempotente de datos verosímiles para apoyar la demostración universitaria. `npm run seed:academico` agrega, en una base que no tenga ya ese conjunto, tres fincas ficticias de Carepa, Chigorodó y Turbo, sus lotes y cultivos, trabajadores identificados con códigos ACAD, ciclos, actividades, cosechas, compradores, ventas y gastos. No reemplaza registros existentes. Los nombres, identificadores y valores económicos son simulados y no representan personas, fincas, clientes ni transacciones reales.')

doc.add_heading('11.5 Implementación y operación', level=2)
for text in [
    'Interfaz web: React. Servidor y API: Node.js con Express. Persistencia: MySQL 8 con esquema y campos en español.',
    'La sesión requiere autenticación y aplica permisos por rol y finca asignada. Las contraseñas se almacenan con hash bcrypt.',
    'El inicio de sesión registra los fallos por correo normalizado y huella hash de la dirección IP. Cinco fallos dentro de 15 minutos bloquean esa combinación durante 15 minutos. Los intentos se guardan en MySQL y se eliminan cuando se inicia sesión correctamente.',
    'El detalle de reportes valida el formato y el rango de fechas y los identificadores de cultivo y comprador. La consulta usa parámetros preparados y mantiene la restricción de acceso a las fincas autorizadas.',
    'En Windows, se prepara la base con `database/schema.sql`, se configura `.env`, se instala con `npm install`, se crea el primer administrador con `npm run setup` y se inicia con `iniciar.bat` o `npm start`.',
    'Los costos de insumos se registran como gastos. El sistema no administra inventario, existencias ni movimientos físicos de insumos.',
    'Si falla la carga del dashboard, la interfaz debe mostrar que los datos no están disponibles en lugar de convertir un error de conexión en ceros. Reiniciar el servidor después de actualizar el proyecto para que cargue la versión nueva de la API.',
]:
    bullet(text)

doc.add_heading('11.6 Pruebas y evidencia', level=2)
doc.add_paragraph('El proyecto incluye pruebas automatizadas ejecutables con `npm test`. En la ejecución registrada el 22 de noviembre de 2026, las siete pruebas de política de bloqueo, expiración de ventana, filtros, rechazo de entradas inválidas y consultas seguras aprobaron; no se reportaron fallos. El documento `docs/PRUEBAS_SEGURIDAD_REPORTES.md` contiene el resultado y un guion de comprobación manual para la sustentación. Las pruebas unitarias no sustituyen la comprobación manual del servidor, MySQL y los permisos por finca.')

doc.core_properties.title = 'Análisis de requisitos actualizado de AgroControl'
doc.core_properties.subject = 'Análisis funcional actualizado según el prototipo universitario'
doc.core_properties.comments = 'Copia actualizada del documento fuente; el original permanece intacto.'
doc.save(output)
print(output)
