const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value) {
  if (!DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function parsePositiveId(value, label) {
  if (value === undefined || value === null || value === '') return null;
  if (!/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) throw new Error(`El filtro de ${label} no es válido.`);
  return Number(value);
}

export function parseReportFilters(query = {}) {
  const desde = String(query.desde || '').trim();
  const hasta = String(query.hasta || '').trim();
  if (desde && !isRealDate(desde)) throw new Error('La fecha inicial no es válida.');
  if (hasta && !isRealDate(hasta)) throw new Error('La fecha final no es válida.');
  if (desde && hasta && desde > hasta) throw new Error('La fecha inicial debe ser anterior o igual a la fecha final.');

  return {
    desde: desde || null,
    hasta: hasta || null,
    cultivoId: parsePositiveId(query.cultivo, 'cultivo'),
    compradorId: parsePositiveId(query.comprador, 'comprador'),
  };
}

export function buildSalesReportQuery(filters, farmIds = null) {
  let sql = `SELECT v.id,v.fecha,v.cantidad,v.unidad,v.precio_unitario,v.total,
    f.id AS finca_id,f.nombre AS finca,l.nombre AS lote,
    c.id AS cultivo_id,c.nombre AS cultivo,c.variedad,
    b.id AS comprador_id,b.nombre AS comprador
    FROM ventas v
    JOIN compradores b ON b.id=v.comprador_id
    JOIN cosechas co ON co.id=v.cosecha_id
    JOIN ciclos_agricolas ca ON ca.id=co.ciclo_id
    JOIN cultivos c ON c.id=ca.cultivo_id
    JOIN lotes l ON l.id=c.lote_id
    JOIN fincas f ON f.id=l.finca_id
    WHERE f.activa=1`;
  const params = [];

  if (filters.desde) { sql += ' AND v.fecha>=?'; params.push(filters.desde); }
  if (filters.hasta) { sql += ' AND v.fecha<=?'; params.push(filters.hasta); }
  if (filters.cultivoId) { sql += ' AND c.id=?'; params.push(filters.cultivoId); }
  if (filters.compradorId) { sql += ' AND b.id=?'; params.push(filters.compradorId); }
  if (farmIds !== null) {
    if (!farmIds.length) return { sql: null, params: [] };
    sql += ' AND f.id IN (?)';
    params.push(farmIds);
  }

  sql += ' ORDER BY v.fecha DESC,v.id DESC LIMIT 1000';
  return { sql, params };
}
