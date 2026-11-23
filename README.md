# AgroControl

Sistema web en español para fincas de la región de Urabá, con gestión de banano, plátano y banano manzano. Organiza lotes, ciclos, trabajadores, actividades, cosechas, compradores, ventas y gastos de producción. La interfaz está hecha con React; la API con Node.js y Express; los datos se guardan en MySQL 8. La estructura conserva el patrón modular de Pharmaboost: `web/`, `server/`, `database/`, `scripts/` y `docs/`.

## Inicio rápido en Windows

Requisitos: Node.js 22 o superior y MySQL 8 instalado y en ejecución.

1. En MySQL Workbench ejecuta `database/schema.sql` con una cuenta administradora para crear la base `agrocontrol` y las tablas. Crea o elige un usuario MySQL dedicado con permisos sobre ese esquema.
2. Copia `.env.example` como `.env` y configura `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` para ese usuario.
3. Ejecuta `npm install`.
4. Ejecuta `npm run setup`. El asistente asegura las tablas del esquema y pide los datos del primer administrador general. La contraseña inicial debe tener al menos 10 caracteres.
5. Abre `iniciar.bat`. El iniciador compila la interfaz si es necesario y arranca el servidor en <http://localhost:3080>.

## Datos para la presentación universitaria

Para llenar una base vacía con registros verosímiles de tres fincas individuales del Urabá (Carepa, Chigorodó y Turbo), ejecuta `npm run seed:academico`. El conjunto incluye lotes, cultivos de banano, plátano y banano manzano, ciclos, trabajadores con identificadores ficticios, actividades, cosechas, compradores, ventas y gastos. No modifica registros existentes y evita cargar el mismo conjunto dos veces. Los datos son simulados para una presentación académica: no representan fincas, personas, compradores ni transacciones reales. Para una instalación nueva, ejecuta el comando después de `npm run setup`.


También puedes ejecutar `npm run build` y después `npm start`. Para desarrollo, usa `npm run dev` y abre <http://localhost:5173>.

## Configuración con MySQL Workbench

Abre y ejecuta `database/schema.sql` desde una conexión con permisos de creación de base de datos y tablas. Después configura `.env`, ejecuta `npm install`, crea el primer administrador con `npm run setup` y arranca la aplicación. `database/consultas_workbench.sql` contiene consultas de producción, tareas, resultado económico y auditoría. Para un diagrama entidad-relación en Workbench: **Database → Reverse Engineer**, selecciona el esquema `agrocontrol`.

## Roles

- **Administrador general:** administración de usuarios, roles y consulta general de la plataforma.
- **Administrador de finca:** gestiona las fincas y sus datos operativos.
- **Encargado de producción:** coordina cultivos, ciclos, actividades y seguimiento productivo.
- **Trabajador:** consulta las labores que se le asignan y reporta su avance según los permisos otorgados.

Las cuentas operativas se crean desde **Usuarios** con su rol y fincas asignadas. Crea el registro del trabajador con el mismo correo de su cuenta para vincular la identidad con sus labores. Las contraseñas se almacenan con bcrypt y la sesión usa una cookie HttpOnly de 12 horas.

Después de actualizar el esquema ejecuta `npm run setup` una vez para crear las tablas nuevas. El inicio de sesión bloquea durante 15 minutos una cuenta y origen después de cinco fallos dentro de una ventana de 15 minutos. El módulo **Reportes** incluye resumen por finca y detalle de ventas filtrable por fechas, cultivo y comprador.

Ejecuta `npm test` para correr las pruebas automatizadas de bloqueo, validación de filtros y construcción segura de consultas. La guía de verificación manual para la sustentación está en `docs/PRUEBAS_SEGURIDAD_REPORTES.md`.

## Estructura

- `web/`: interfaz React adaptable a computador, tableta y celular.
- `server/`: API, autenticación, controladores y acceso a MySQL.
- `database/`: esquema SQL en español y consultas para Workbench.
- `scripts/`: configuración inicial y creación del primer administrador.
- `docs/`: manual de usuario y requisitos resumidos.

## Alcance y operación

Las fincas pueden identificarse por municipio o vereda del Urabá antioqueño. El catálogo de cultivos propone banano, plátano y banano manzano, y permite registrar otros cultivos y variedades locales. Para cosechas se ofrecen kg, toneladas, racimos, cajas o unidades; conserva la misma unidad en cada ciclo al registrar ventas. Los datos de producción, ventas y gastos se relacionan con los ciclos y fincas correspondientes. Las ventas advierten si la cantidad ingresada supera la cosecha registrada. El sistema calcula ingresos, gastos y resultado neto con los registros disponibles. AgroControl **no** controla inventarios, almacenes, existencias ni movimientos físicos de insumos; los insumos solo pueden aparecer como concepto de gasto.

Configura HTTPS en producción, utiliza credenciales MySQL dedicadas y programa copias de seguridad periódicas. Ejecuta Node.js con `NODE_ENV=production` detrás de un proxy HTTPS para habilitar la cookie segura. El acceso requiere conexión a la base de datos; no se incluye modo sin conexión.
