CREATE DATABASE IF NOT EXISTS agrocontrol CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agrocontrol;

CREATE TABLE IF NOT EXISTS usuarios (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(120) NOT NULL, correo VARCHAR(190) NOT NULL UNIQUE,
 clave_hash VARCHAR(255) NOT NULL, rol ENUM('administrador_general','administrador_finca','encargado_produccion','trabajador') NOT NULL,
 activo BOOLEAN NOT NULL DEFAULT TRUE, creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS fincas (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, nombre VARCHAR(140) NOT NULL, ubicacion VARCHAR(255) NOT NULL,
 area_hectareas DECIMAL(12,3) NOT NULL, tarifa_hectarea DECIMAL(12,2) NOT NULL DEFAULT 40000 CHECK (tarifa_hectarea > 0), descripcion TEXT, activa BOOLEAN NOT NULL DEFAULT TRUE, creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS usuarios_fincas (
 usuario_id BIGINT UNSIGNED NOT NULL, finca_id BIGINT UNSIGNED NOT NULL, PRIMARY KEY(usuario_id,finca_id),
 FOREIGN KEY(usuario_id) REFERENCES usuarios(id), FOREIGN KEY(finca_id) REFERENCES fincas(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS sesiones (
 token_hash CHAR(64) PRIMARY KEY, usuario_id BIGINT UNSIGNED NOT NULL, vence_en DATETIME NOT NULL,
 FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE, INDEX idx_sesion_vence(vence_en)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS intentos_inicio_sesion (
 correo VARCHAR(190) NOT NULL,
 ip_hash CHAR(64) NOT NULL,
 intentos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
 ventana_inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 bloqueado_hasta DATETIME NULL,
 actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY(correo,ip_hash),
 INDEX idx_intentos_actualizado(actualizado_en)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS lotes (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, finca_id BIGINT UNSIGNED NOT NULL, nombre VARCHAR(100) NOT NULL,
 area_hectareas DECIMAL(12,3) NOT NULL, descripcion TEXT, activo BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE(finca_id,nombre), FOREIGN KEY(finca_id) REFERENCES fincas(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS trabajadores (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, finca_id BIGINT UNSIGNED NOT NULL, nombre VARCHAR(140) NOT NULL,
 documento VARCHAR(50) NOT NULL, telefono VARCHAR(60) DEFAULT '', correo VARCHAR(190) DEFAULT '', activo BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE(finca_id,documento), FOREIGN KEY(finca_id) REFERENCES fincas(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS cultivos (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, lote_id BIGINT UNSIGNED NOT NULL, nombre VARCHAR(140) NOT NULL,
 variedad VARCHAR(120) DEFAULT '', descripcion TEXT, activo BOOLEAN NOT NULL DEFAULT TRUE, FOREIGN KEY(lote_id) REFERENCES lotes(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ciclos_agricolas (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, cultivo_id BIGINT UNSIGNED NOT NULL, fecha_inicio DATE NOT NULL,
 fecha_fin DATE NULL, estado ENUM('planeado','activo','finalizado','cancelado') NOT NULL DEFAULT 'planeado', notas TEXT,
 CHECK(fecha_fin IS NULL OR fecha_fin>=fecha_inicio), FOREIGN KEY(cultivo_id) REFERENCES cultivos(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS actividades (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, finca_id BIGINT UNSIGNED NOT NULL, lote_id BIGINT UNSIGNED NULL,
 ciclo_id BIGINT UNSIGNED NULL, trabajador_id BIGINT UNSIGNED NULL, titulo VARCHAR(160) NOT NULL, descripcion TEXT,
 fecha_programada DATE NOT NULL, estado ENUM('pendiente','en_proceso','finalizada','cancelada') NOT NULL DEFAULT 'pendiente', observaciones TEXT,
 INDEX idx_actividades_finca_fecha(finca_id,fecha_programada),
 FOREIGN KEY(finca_id) REFERENCES fincas(id), FOREIGN KEY(lote_id) REFERENCES lotes(id), FOREIGN KEY(ciclo_id) REFERENCES ciclos_agricolas(id), FOREIGN KEY(trabajador_id) REFERENCES trabajadores(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS cosechas (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, ciclo_id BIGINT UNSIGNED NOT NULL, fecha DATE NOT NULL,
 cantidad DECIMAL(14,3) NOT NULL, unidad VARCHAR(30) NOT NULL, observaciones TEXT, INDEX idx_cosechas_fecha(fecha),
 CHECK(cantidad>0), FOREIGN KEY(ciclo_id) REFERENCES ciclos_agricolas(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS compradores (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, finca_id BIGINT UNSIGNED NOT NULL, nombre VARCHAR(160) NOT NULL,
 identificacion VARCHAR(60) DEFAULT '', telefono VARCHAR(60) DEFAULT '', correo VARCHAR(190) DEFAULT '', direccion VARCHAR(255) DEFAULT '', activo BOOLEAN DEFAULT TRUE,
 FOREIGN KEY(finca_id) REFERENCES fincas(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ventas (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, cosecha_id BIGINT UNSIGNED NOT NULL, comprador_id BIGINT UNSIGNED NOT NULL,
 fecha DATE NOT NULL, cantidad DECIMAL(14,3) NOT NULL, unidad VARCHAR(30) NOT NULL, precio_unitario DECIMAL(14,2) NOT NULL,
 total DECIMAL(16,2) NOT NULL, observaciones TEXT, INDEX idx_ventas_fecha(fecha), CHECK(cantidad>0 AND precio_unitario>=0 AND total>=0),
 FOREIGN KEY(cosecha_id) REFERENCES cosechas(id), FOREIGN KEY(comprador_id) REFERENCES compradores(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS gastos (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, finca_id BIGINT UNSIGNED NOT NULL, lote_id BIGINT UNSIGNED NULL,
 ciclo_id BIGINT UNSIGNED NULL, fecha DATE NOT NULL, categoria ENUM('mano_de_obra','insumos_utilizados','transporte','servicios','otros') NOT NULL,
 descripcion VARCHAR(255) NOT NULL, valor DECIMAL(16,2) NOT NULL, observaciones TEXT, INDEX idx_gastos_fecha(fecha), CHECK(valor>=0),
 FOREIGN KEY(finca_id) REFERENCES fincas(id), FOREIGN KEY(lote_id) REFERENCES lotes(id), FOREIGN KEY(ciclo_id) REFERENCES ciclos_agricolas(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS auditoria (
 id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, usuario_id BIGINT UNSIGNED NULL, accion VARCHAR(60) NOT NULL,
 entidad VARCHAR(60) NOT NULL, entidad_id BIGINT NULL, detalle TEXT, fecha_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL, INDEX idx_auditoria_fecha(fecha_hora)
) ENGINE=InnoDB;

