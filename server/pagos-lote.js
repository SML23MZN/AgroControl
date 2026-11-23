import {tarifaLabor,pagoPrevisto} from '../shared/tarifas.js';

const disponible = `a.gasto_pago_id IS NULL AND NOT EXISTS (
 SELECT 1 FROM gastos g WHERE g.finca_id=a.finca_id AND g.categoria='mano_de_obra'
 AND g.observaciones LIKE CONCAT('Pago por tarea #',a.id,' · %'))`;
export const pendienteDePago = disponible;

export async function tareasLote(db,finca,trabajador,lote,bloquear=false){
 const [rows]=await db.execute(`SELECT a.id,a.titulo,a.hectareas_tarea,f.tarifa_hectarea
 FROM actividades a JOIN fincas f ON f.id=a.finca_id
 JOIN lotes l ON l.id=a.lote_id AND l.finca_id=a.finca_id
 JOIN trabajadores t ON t.id=a.trabajador_id AND t.finca_id=a.finca_id
 WHERE a.finca_id=? AND a.trabajador_id=? AND a.lote_id=? AND a.estado='finalizada'
 AND ${disponible} ORDER BY a.id ${bloquear?'FOR UPDATE':''}`,[finca,trabajador,lote]);
 return rows.map(row=>{
  const tarifa=tarifaLabor(row.tarifa_hectarea,row.titulo);
  const importe=row.hectareas_tarea>0?pagoPrevisto(row.hectareas_tarea,tarifa):null;
  return {id:row.id,titulo:row.titulo,ha:row.hectareas_tarea,tarifa,importe};
 });
}

export async function pagarLote(conn,ids,fecha,usuario,confirmadas){
 const [finca,trabajador,lote]=ids;
 const tareas=await tareasLote(conn,...ids,true);
 if(!tareas.length || tareas.some(t=>!(t.importe>0)) ||
    JSON.stringify(tareas)!==JSON.stringify(confirmadas)){
  const error=new Error('Revisa el detalle actualizado. Cada tarea debe tener un área y un importe para pagarla por lote.');
  error.status=409;throw error;
 }
 const total=tareas.reduce((s,t)=>s+Math.round(t.importe*100),0)/100;
 const [[persona]]=await conn.execute('SELECT nombre FROM trabajadores WHERE id=?',[trabajador]);
 const detalle=tareas.map(t=>'#'+t.id+' '+t.titulo+' · '+t.ha+' ha × '+t.tarifa+' = '+t.importe+' COP').join('\n');
 const [gasto]=await conn.execute("INSERT INTO gastos(finca_id,lote_id,fecha,categoria,descripcion,valor,observaciones) VALUES(?,?,?,'mano_de_obra',?,?,?)",
 [finca,lote,fecha,'Pago por lote a '+persona.nombre,total,detalle]);
 const [marcas]=await conn.query('UPDATE actividades SET gasto_pago_id=? WHERE gasto_pago_id IS NULL AND id IN (?)',[gasto.insertId,tareas.map(t=>t.id)]);
 if(marcas.affectedRows!==tareas.length)throw new Error('No fue posible asociar todas las tareas.');
 await conn.execute("INSERT INTO auditoria(usuario_id,accion,entidad,entidad_id,detalle) VALUES(?,'crear','gastos',?,?)",[usuario,gasto.insertId,'Pago por lote de '+tareas.length+' tareas']);
 return {id:gasto.insertId,valor:total};
}
