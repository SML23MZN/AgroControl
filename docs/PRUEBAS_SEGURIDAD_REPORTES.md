# Evidencia de pruebas de seguridad y reportes

## Pruebas automatizadas ejecutadas

Fecha de ejecución: 22 de noviembre de 2026.

Comando: `npm test`.

Resultado: **7 pruebas aprobadas, 0 fallidas**. Las pruebas unitarias verifican la política de bloqueo tras cinco intentos, el reinicio de la ventana, la duración del bloqueo, la validación de fechas e identificadores y la construcción parametrizada del reporte con alcance por finca.

| Prueba | Resultado |
| --- | --- |
| El quinto intento fallido bloquea el acceso por 15 minutos | Aprobada |
| Una ventana de intentos vencida permite iniciar un nuevo conteo | Aprobada |
| El bloqueo activo conserva el tiempo restante | Aprobada |
| Fechas válidas y filtros opcionales se aceptan | Aprobada |
| Fechas inexistentes y rangos invertidos se rechazan | Aprobada |
| Identificadores de cultivo o comprador inválidos se rechazan | Aprobada |
| El SQL del detalle usa parámetros y limita el resultado a fincas autorizadas | Aprobada |

## Criterio implementado en el inicio de sesión

Los fallos se cuentan por correo normalizado y huella hash de la IP de origen. El quinto fallo dentro de una ventana de 15 minutos bloquea esa combinación durante 15 minutos. Mientras dure el bloqueo, la API responde con estado HTTP 429. Un acceso correcto elimina los contadores asociados al correo. Los intentos se guardan en MySQL en `intentos_inicio_sesion`, por lo que reiniciar el servidor no reinicia el conteo.

## Reportes disponibles

El módulo conserva el resumen histórico por finca y agrega un detalle de ventas con filtros por fecha inicial, fecha final, cultivo y comprador. La API recibe los filtros en `GET /api/reportes/ventas`; las fechas y los identificadores se validan antes de ejecutar una consulta parametrizada. El rol y las fincas asignadas se verifican en el servidor.

## Guion de comprobación manual para la sustentación

Estas verificaciones complementan las pruebas automatizadas y se deben ejecutar frente al docente en la instalación local:

1. En la pantalla de ingreso, introduce una contraseña incorrecta cinco veces para la misma cuenta y desde el mismo navegador. Confirma cuatro respuestas de credenciales inválidas y el bloqueo temporal en el quinto fallo.
2. Confirma que durante el bloqueo no permite iniciar sesión. Espera 15 minutos para demostrar el vencimiento; luego inicia sesión con la contraseña correcta.
3. Inicia sesión con un rol de trabajador e intenta consultar reportes o usuarios. La API debe denegar los módulos no autorizados.
4. Abre **Reportes**, filtra las ventas por rango de fechas, cultivo y comprador. Compara los resultados y totales con los registros almacenados en MySQL Workbench.
5. Cambia a un usuario asignado a otra finca y verifica que no pueda consultar ventas de una finca ajena.
6. Introduce una fecha imposible, un rango invertido o un identificador manipulado en la consulta. La API debe rechazarlos sin ejecutar SQL construido con esos valores.

Las pruebas automatizadas cubren la lógica de bloqueo y validación del constructor de consultas; el guion anterior es una verificación manual de la integración completa con la base de datos y los permisos.
