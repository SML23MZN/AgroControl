# Manual de usuario de AgroControl

AgroControl está preparado para el registro de fincas del Urabá antioqueño y sus cultivos de banano, plátano y banano manzano. En ubicación escribe municipio y, si aplica, vereda. Los nombres de cultivo y variedad se pueden adaptar al uso local de cada finca.

AgroControl organiza cada finca de manera independiente. Registra los datos reales de cada explotación, sus lotes y ciclos agrícolas para que los indicadores correspondan a esa finca.

## 1. Acceso

Abre la dirección que te entregue la persona administradora (en una instalación local: `http://localhost:3080`). Ingresa tu correo y contraseña. Al entrar, verás los módulos habilitados para tu rol. Usa el botón de salida junto a tu nombre para cerrar sesión. La sesión vence después de 12 horas.

Si no tienes una cuenta o no puedes entrar, solicita acceso al administrador general. No compartas tu contraseña. Cada usuario ve la información de las fincas que le fueron asignadas.

Después de cinco intentos fallidos desde el mismo origen, el acceso a esa combinación de correo y origen queda bloqueado durante 15 minutos. Espera a que termine el bloqueo antes de intentar de nuevo.

## 2. Panel principal

El panel presenta fincas activas, lotes, actividades pendientes, producción total, ingresos por ventas, gastos y resultado neto. Las cifras se calculan con los registros guardados. Un resultado negativo indica que los gastos registrados superan los ingresos capturados; revisa el período y la información cargada antes de tomar decisiones.

## 3. Orden recomendado para comenzar

1. Registra una **finca** con nombre, ubicación y área en hectáreas.
2. Crea los **lotes** indicando su finca, nombre y área.
3. Registra los **trabajadores** vinculados a cada finca.
4. Crea los **cultivos** en los lotes y abre un **ciclo agrícola** con fecha de inicio y estado.
5. Programa **actividades**, indica fecha, lote o ciclo y asigna un trabajador.
6. Registra las **cosechas** obtenidas, especificando cantidad y unidad (por ejemplo, kg o cajas).
7. Registra los **compradores**, luego las **ventas** vinculadas a una cosecha.
8. Carga los **gastos** de producción y su categoría para analizar el resultado.

Las listas se pueden buscar escribiendo en el campo de búsqueda. Usa **Nuevo registro** para crear y **Editar** para modificar. Los registros con estado activo pueden desactivarse; cuando existen relaciones históricas, MySQL puede impedir una operación que rompería la integridad del historial.

## 4. Cómo usar cada módulo

### Fincas y lotes

El área se registra en hectáreas y debe ser un número positivo. Un lote siempre pertenece a una finca. Mantén nombres de lote únicos dentro de la misma finca.

### Cultivos y ciclos agrícolas

Especifica el cultivo y variedad. Cada ciclo lleva fecha de inicio, fecha final opcional y estado: planeado, activo, finalizado o cancelado. El historial de ciclos permite revisar cosechas y resultados por temporada.

### Trabajadores y actividades

Registra nombre y documento del trabajador y asígnalo a una finca. Al programar una actividad, incluye título, fecha, finca y, cuando aplique, lote, ciclo y responsable. Actualiza el estado a **En proceso** al iniciar y **Finalizada** al terminar; agrega observaciones para dejar contexto.

### Cosechas

Selecciona el ciclo de donde proviene la producción, registra fecha, cantidad positiva y unidad. La unidad debe ser consistente cuando compares lotes o registres ventas.

### Compradores y ventas

Registra nombre y contacto del comprador. Para la venta, selecciona cosecha, comprador, fecha, cantidad y unidad, y escribe el precio unitario. El total se calcula como cantidad por precio. Si la venta excede la cantidad cosechada que aparece registrada, AgroControl muestra una advertencia para que revises el dato.

### Gastos

Selecciona finca, fecha y categoría: mano de obra, insumos utilizados, transporte, servicios u otros. Relaciona el lote y ciclo cuando se conozcan. Registra el importe como valor numérico en pesos colombianos. Este módulo contabiliza el costo; no descuenta existencias de inventario.

### Reportes

El resumen general presenta producción, ingresos, gastos y resultado por finca. En el detalle de ventas puedes limitar los resultados con las fechas Desde y Hasta, el cultivo y el comprador; pulsa **Aplicar filtros**. Usa **Limpiar** para quitar esos criterios. Las fechas se aplican a la fecha de venta y los registros se ordenan del más reciente al más antiguo. El total de ventas refleja las filas que coinciden con los filtros y la búsqueda.

### Usuarios y auditoría

El administrador general crea cuentas operativas, selecciona rol y fincas permitidas. Para asociar la cuenta de trabajador con sus asignaciones, utiliza el mismo correo en el registro de trabajador y en la cuenta. La auditoría conserva quién hizo operaciones relevantes y cuándo.

## 5. Roles

- **Administrador general:** gestiona cuentas y roles y consulta auditoría.
- **Administrador de finca:** organiza los datos de las fincas asignadas y su información administrativa.
- **Encargado de producción:** coordina cultivos, ciclos, actividades, cosechas y seguimiento operativo.
- **Trabajador:** consulta y reporta el avance de las actividades que se le han asignado, de acuerdo con los permisos habilitados.

Si un módulo no aparece, es probable que tu rol no tenga acceso. Contacta al administrador general para revisar las fincas asignadas.

## 6. Buenas prácticas y solución de problemas

- Usa la misma unidad de medida en cosecha y venta. AgroControl ofrece kg, toneladas, racimos, cajas y unidades.
- Revisa fechas, cantidades y precios antes de guardar; los importes deben estar en la moneda configurada (COP).
- Un aviso de registro duplicado significa que ya hay un nombre/código equivalente o un correo/documento repetido.
- Un aviso de datos relacionados indica que el registro está conectado con información histórica. Conserva el historial y desactiva el registro cuando esté disponible.
- Si no ves cambios, recarga la página y confirma que se guardaron. Si el servidor no responde, contacta a la persona responsable de la instalación.
- Los indicadores dependen de la información registrada y no reemplazan la revisión contable ni el análisis agronómico.

## 7. Privacidad y copias de seguridad

No compartas las credenciales. La base de datos contiene información de trabajadores y operaciones económicas. El responsable técnico debe configurar copias periódicas y guardarlas en una ubicación segura. En MySQL Workbench se puede exportar el esquema `agrocontrol` desde **Server → Data Export**, incluyendo estructura y datos. En producción se debe acceder mediante HTTPS.
