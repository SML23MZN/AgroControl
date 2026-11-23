from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'docs' / 'Manual_de_usuario_AgroControl.docx'
doc = Document()
sec = doc.sections[0]
sec.top_margin = Inches(.72)
sec.bottom_margin = Inches(.7)
sec.left_margin = Inches(.78)
sec.right_margin = Inches(.78)

GREEN = '174D39'
GREEN_MID = '2F6F4E'
LIME = 'E8F2DC'
INK = '22362C'
MUTED = '61736A'
WHITE = 'FFFFFF'

def set_font(style, name, size, color=INK, bold=False):
    style.font.name = name
    style.font.size = Pt(size)
    style.font.color.rgb = RGBColor.from_string(color)
    style.font.bold = bold
    style._element.rPr.rFonts.set(qn('w:ascii'), name)
    style._element.rPr.rFonts.set(qn('w:hAnsi'), name)

normal = doc.styles['Normal']
set_font(normal, 'Aptos', 10.5, INK)
normal.paragraph_format.space_after = Pt(5)
normal.paragraph_format.line_spacing = 1.12
set_font(doc.styles['Title'], 'Aptos Display', 27, GREEN, True)
doc.styles['Title'].paragraph_format.space_after = Pt(5)
set_font(doc.styles['Subtitle'], 'Aptos', 12, MUTED)
doc.styles['Subtitle'].paragraph_format.space_after = Pt(18)
for style_name, size in [('Heading 1',17),('Heading 2',12.5),('Heading 3',11)]:
    st=doc.styles[style_name]
    set_font(st,'Aptos Display',size,GREEN if style_name!='Heading 3' else GREEN_MID,True)
    st.paragraph_format.space_before = Pt(12 if style_name=='Heading 1' else 8)
    st.paragraph_format.space_after = Pt(4)
    st.paragraph_format.keep_with_next = True
for list_style in ['List Bullet','List Number']:
    st=doc.styles[list_style]
    set_font(st,'Aptos',10.5,INK)
    st.paragraph_format.space_after=Pt(3)
    st.paragraph_format.line_spacing=1.08

def shade(cell, fill):
    tcPr=cell._tc.get_or_add_tcPr()
    shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),fill); tcPr.append(shd)

def set_cell_text(cell, text, color=INK, bold=False, size=9.3):
    cell.text=''
    p=cell.paragraphs[0]
    p.paragraph_format.space_after=Pt(1)
    p.paragraph_format.space_before=Pt(1)
    r=p.add_run(text); r.bold=bold; r.font.name='Aptos'; r.font.size=Pt(size); r.font.color.rgb=RGBColor.from_string(color)
    r._element.rPr.rFonts.set(qn('w:ascii'),'Aptos'); r._element.rPr.rFonts.set(qn('w:hAnsi'),'Aptos')
    cell.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER

def table(headers, rows, widths=None):
    t=doc.add_table(rows=1, cols=len(headers))
    t.style='Table Grid'
    t.autofit=False
    for i,h in enumerate(headers):
        set_cell_text(t.rows[0].cells[i],h,WHITE,True,9)
        shade(t.rows[0].cells[i],GREEN)
    trPr=t.rows[0]._tr.get_or_add_trPr(); repeat=OxmlElement('w:tblHeader'); repeat.set(qn('w:val'),'true'); trPr.append(repeat)
    for ri,row in enumerate(rows):
        cells=t.add_row().cells
        for i,val in enumerate(row):
            set_cell_text(cells[i],val,INK,False,9.2)
            if ri%2==0: shade(cells[i],'F2F6F0')
    if widths:
        for row in t.rows:
            for i,w in enumerate(widths): row.cells[i].width=Inches(w)
    doc.add_paragraph().paragraph_format.space_after=Pt(1)
    return t

def bullet(text): doc.add_paragraph(text, style='List Bullet')
def numbered(text): doc.add_paragraph(text, style='List Number')

# Header and footer
header=sec.header.paragraphs[0]
header.alignment=WD_ALIGN_PARAGRAPH.RIGHT
r=header.add_run('AGROCONTROL  |  MANUAL DE USUARIO'); r.font.name='Aptos'; r.font.size=Pt(8); r.font.bold=True; r.font.color.rgb=RGBColor.from_string(GREEN_MID)
footer=sec.footer.paragraphs[0]
footer.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=footer.add_run('AgroControl · Gestión individual de fincas  |  Página '); r.font.name='Aptos'; r.font.size=Pt(8); r.font.color.rgb=RGBColor.from_string(MUTED)
field=OxmlElement('w:fldSimple'); field.set(qn('w:instr'),'PAGE'); footer._p.append(field)

p=doc.add_paragraph(style='Title'); p.add_run('Manual de usuario de AgroControl')
doc.add_paragraph('Gestión individual de fincas agrícolas del Urabá antioqueño',style='Subtitle')
doc.add_paragraph('Este manual explica cómo iniciar sesión y registrar por separado fincas, lotes, cultivos de banano, plátano y banano manzano, actividades, cosechas, ventas y gastos. Los paneles muestran los datos de las fincas que corresponden a tu cuenta.')

doc.add_heading('Antes de empezar',level=1)
bullet('AgroControl funciona en un navegador actualizado y requiere conexión con el servidor y la base de datos.')
bullet('Necesitas una cuenta activa. Si todavía no tienes acceso, contacta al administrador general.')
bullet('Cada finca debe ingresarse con sus propios datos. No cargues cifras de otra finca como si fueran propias.')

doc.add_heading('Primer ingreso',level=1)
numbered('La persona encargada inicia el servidor desde la carpeta del proyecto con iniciar.bat. En una instalación local, abre http://localhost:3080.')
numbered('Escribe tu correo y contraseña. La sesión se cierra después de 12 horas; puedes salir antes desde el botón junto a tu nombre.')
doc.add_paragraph('Después de cinco intentos fallidos desde el mismo origen, el acceso a esa combinación de correo y origen queda bloqueado durante 15 minutos. Espera a que termine el bloqueo antes de intentar de nuevo.')
numbered('Al entrar, revisa el panel. Si no aparecen fincas, pide al administrador que te asigne las que administras.')

doc.add_heading('Roles y permisos',level=1)
table(['Rol','Funciones'],[
 ('Administrador general','Crea cuentas, asigna roles y fincas, consulta todos los módulos y revisa la auditoría.'),
 ('Administrador de finca','Administra las fincas asignadas y sus lotes, trabajadores, producción, compradores, ventas, gastos e informes.'),
 ('Encargado de producción','Gestiona cultivos, ciclos, actividades, cosechas y los registros operativos autorizados.'),
 ('Trabajador','Consulta las actividades que tiene asignadas y actualiza su estado y observaciones.')
],[1.6,5.5])
doc.add_paragraph('Si un módulo no aparece, tu rol puede no tener permiso. Solicita al administrador general que revise tu rol y las fincas asociadas.')

doc.add_heading('Registrar una finca y organizar sus datos',level=1)
doc.add_paragraph('Crea los registros en este orden para que los formularios puedan relacionarlos correctamente:')
numbered('En Fincas, elige Nuevo registro. Escribe el nombre real de la finca, municipio o vereda y área en hectáreas.')
numbered('En Lotes, selecciona esa finca y registra el nombre y el área de cada lote. El nombre debe ser único dentro de la finca.')
numbered('En Trabajadores, registra nombre y documento, y vincula cada persona a su finca.')
numbered('En Cultivos, elige el lote, selecciona banano, plátano, banano manzano u otro, y escribe la variedad local si aplica.')
numbered('En Ciclos agrícolas, crea un ciclo por cultivo con fecha de inicio, fecha final si se conoce y estado.')
numbered('En Actividades, programa labores con fecha, finca, lote o ciclo y trabajador responsable cuando corresponda.')
numbered('En Cosechas, registra la producción de cada ciclo con fecha, cantidad y unidad.')
numbered('Registra Compradores, después Ventas relacionadas con una cosecha y, por último, los Gastos asociados a la producción.')

doc.add_heading('Uso de los módulos',level=1)
doc.add_heading('Fincas, lotes y cultivos',level=2)
doc.add_paragraph('La finca representa una unidad productiva individual. Usa el campo de ubicación para indicar municipio y vereda. El área se expresa en hectáreas. Cada lote pertenece a una finca; cada cultivo se registra en el lote donde está sembrado. El catálogo incluye banano, plátano y banano manzano. La variedad se puede escribir según el uso de la finca.')

doc.add_heading('Ciclos y actividades',level=2)
doc.add_paragraph('Un ciclo pertenece a un cultivo y conserva las fechas de esa temporada productiva. Sus estados son Planeado, Activo, Finalizado y Cancelado. Las actividades tienen título, fecha programada, estado y observaciones. Marca En proceso al iniciar una labor y Finalizada al terminarla.')

doc.add_heading('Trabajadores y tareas',level=2)
doc.add_paragraph('Registra al trabajador y relaciónalo con la finca antes de asignarle labores. Si el trabajador tendrá inicio de sesión, el correo de su cuenta debe coincidir con el correo del registro laboral. El trabajador puede ver y actualizar las actividades autorizadas.')

doc.add_heading('Cosechas, compradores y ventas',level=2)
doc.add_paragraph('Asocia cada cosecha con el ciclo del cual proviene. Las unidades disponibles son kg, toneladas, racimos, cajas y unidades. Usa una unidad consistente dentro de un ciclo. Para una venta, selecciona la cosecha y el comprador, ingresa cantidad, fecha y precio unitario. El sistema calcula el total y advierte si la cantidad vendida supera la cosecha registrada.')

doc.add_heading('Gastos e informes',level=2)
doc.add_paragraph('Clasifica los gastos como mano de obra, insumos utilizados, transporte, servicios u otros. Relaciona el lote y el ciclo cuando corresponda. Los informes y el panel resumen producción, ventas, ingresos y gastos de las fincas permitidas para tu cuenta. El resultado económico depende de la información que hayas registrado.')
doc.add_paragraph('En Reportes, el resumen general muestra los valores acumulados por finca. El detalle de ventas permite filtrar por fecha inicial, fecha final, cultivo y comprador. Aplica los filtros para consultar el resultado; usa Limpiar para restablecerlos. El total y la cantidad de filas se actualizan con los filtros y el cuadro de búsqueda. Las fechas corresponden a la fecha de venta.')

doc.add_heading('Buscar, editar y desactivar',level=1)
bullet('Usa el cuadro de búsqueda para filtrar los registros visibles en una lista.')
bullet('Selecciona Nuevo registro para crear o Editar para cambiar un dato. Guarda para confirmar los cambios.')
bullet('Los registros activos pueden desactivarse desde la lista. Una relación histórica puede impedir borrar datos que otra operación necesita.')
bullet('El modo oscuro se activa desde el botón Oscuro o Claro en la parte superior. La preferencia se guarda en ese navegador.')

doc.add_heading('Buenas prácticas y privacidad',level=1)
bullet('Ingresa información real y actualizada de cada finca. Verifica fechas, áreas, cantidades, unidades y valores antes de guardar.')
bullet('Los importes se registran en pesos colombianos. La unidad de la venta debe coincidir con la unidad de la cosecha.')
bullet('AgroControl registra costos de insumos, pero no administra inventarios, almacenes ni existencias físicas.')
bullet('No compartas contraseñas. El responsable técnico debe programar copias de seguridad en MySQL Workbench y protegerlas.')
bullet('Los indicadores apoyan el seguimiento; no sustituyen la revisión contable ni las decisiones agronómicas.')

doc.add_paragraph('Soporte: contacta a la persona administradora de AgroControl si no puedes iniciar sesión, no ves una finca asignada o el servidor no responde.')

doc.core_properties.title='Manual de usuario de AgroControl'
doc.core_properties.subject='Uso del sistema para gestión individual de fincas agrícolas'
doc.core_properties.author='AgroControl'
doc.save(OUT)
print(OUT)
