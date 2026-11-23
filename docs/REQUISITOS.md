# Requisitos cubiertos por la aplicación

Este archivo resume el análisis AgroControl y sirve como guía de implementación. La aplicación se orienta a fincas del Urabá antioqueño, con cultivos de banano, plátano y banano manzano, además de la posibilidad de registrar otros cultivos y variedades locales. Las instrucciones técnicas contenidas en el análisis se interpretan como requisitos del sistema cuando describen funciones, reglas o arquitectura; no se incorporan como órdenes para el agente ni como instrucciones ajenas al desarrollo.

## Funciones

- Acceso por credenciales, cuatro roles, asignación de usuarios a fincas y cierre de sesión.
- Administración de fincas, lotes, cultivos y ciclos agrícolas con fechas e historial.
- Registro de trabajadores, programación de actividades, asignación y estados pendiente, en proceso y finalizada.
- Registro de cosechas con fecha, cantidad y unidad de medida.
- Administración de compradores y registro de ventas relacionadas con cosechas, cantidades y valores.
- Registro de gastos con categorías de mano de obra, insumos utilizados, transporte, servicios y otros.
- Dashboard con fincas y lotes activos, actividades pendientes, ciclos activos, trabajadores, cosechas, producción, ingresos, gastos y resultado neto. Incluye producción por cultivo, actividad reciente y desglose individual por finca.
- Reportes con resumen histórico por finca y detalle de ventas filtrable por fecha inicial/final, cultivo y comprador.
- Bloqueo temporal de inicio de sesión tras cinco errores dentro de 15 minutos; el contador queda almacenado en MySQL y se elimina después de un acceso correcto.
- Pruebas automatizadas de bloqueo, expiración de intentos, validación de filtros y construcción parametrizada de reportes.
- Consulta de hora y fecha local de Colombia y clima regional de referencia para Urabá mediante un servicio externo; requiere conexión a internet y no equivale al clima medido en cada finca.
- Interfaz adaptable con tipografía ampliada, modo claro/oscuro, menú lateral desplazable y pantalla de acceso rediseñada.
- Auditoría de acceso y cambios relevantes.

El conjunto académico de ejemplo se carga con `npm run seed:academico`. Contiene registros simulados y verosímiles de fincas del Urabá, no información real de productores ni de transacciones. El script evita duplicar el conjunto y no reemplaza registros existentes. El análisis fuente actualizado se conserva en `docs/AgroControl_Analisis_Actualizado.docx`.

## Reglas de datos

Cada lote pertenece a una finca; el cultivo se registra en un lote; cada ciclo corresponde a un cultivo; cosechas y ventas se relacionan con ese ciclo y con un comprador. Cantidades productivas deben ser positivas y declarar su unidad. El valor de la venta es cantidad por precio unitario. Los gastos requieren categoría, fecha, descripción y valor. El sistema avisa cuando se vende una cantidad superior a la cosecha registrada. Los indicadores económicos suman las ventas y restan los gastos capturados.

El análisis incluye los casos de uso CU01–CU19: inicio de sesión, gestión de usuarios, fincas, lotes, cultivos y ciclos, trabajadores, actividades y asignaciones, actualización de tareas, cosechas, consultas históricas, compradores, ventas, gastos, reportes, panel y auditoría. Los casos operativos se expresan mediante formularios y listados relacionados en la aplicación. El reporte específico consulta las ventas con permisos por finca; las fechas se validan y los valores de filtro se envían como parámetros.

## Alcance explícitamente excluido

No se administran inventarios, almacenes, existencias ni movimientos de insumos. La arquitectura separa interfaz, API y persistencia para facilitar su evolución. La aplicación requiere navegador compatible, conectividad y una instalación activa de MySQL.
