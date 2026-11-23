USE agrocontrol;

-- Actividades pendientes por finca
SELECT f.nombre AS finca, a.titulo AS actividad, a.fecha_programada,
       a.estado, t.nombre AS responsable
FROM actividades a
JOIN fincas f ON f.id=a.finca_id
LEFT JOIN trabajadores t ON t.id=a.trabajador_id
WHERE a.estado IN ('pendiente','en_proceso')
ORDER BY a.fecha_programada;

-- Producción por cultivo y ciclo
SELECT f.nombre AS finca, l.nombre AS lote, c.nombre AS cultivo,
       ca.id AS ciclo, COALESCE(SUM(co.cantidad),0) AS cantidad,
       co.unidad
FROM cultivos c
JOIN lotes l ON l.id=c.lote_id
JOIN fincas f ON f.id=l.finca_id
JOIN ciclos_agricolas ca ON ca.cultivo_id=c.id
LEFT JOIN cosechas co ON co.ciclo_id=ca.id
GROUP BY f.nombre,l.nombre,c.nombre,ca.id,co.unidad
ORDER BY f.nombre,c.nombre;

-- Ingresos, gastos y resultado neto por finca
SELECT f.id,f.nombre,
       COALESCE(v.ingresos,0) AS ingresos,
       COALESCE(g.gastos,0) AS gastos,
       COALESCE(v.ingresos,0)-COALESCE(g.gastos,0) AS resultado_neto
FROM fincas f
LEFT JOIN (SELECT b.finca_id,SUM(ve.total) ingresos FROM ventas ve JOIN compradores b ON b.id=ve.comprador_id GROUP BY b.finca_id) v ON v.finca_id=f.id
LEFT JOIN (SELECT finca_id,SUM(valor) gastos FROM gastos GROUP BY finca_id) g ON g.finca_id=f.id
ORDER BY f.nombre;

-- Historial de operaciones recientes
SELECT a.fecha_hora,u.nombre AS usuario,a.accion,a.entidad,a.entidad_id,a.detalle
FROM auditoria a LEFT JOIN usuarios u ON u.id=a.usuario_id
ORDER BY a.fecha_hora DESC LIMIT 200;
