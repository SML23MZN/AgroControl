import {tarifaLabor} from '../shared/tarifas.js';
export function registerWorkerPayments(app, auth, db, farmIds) {
 app.post('/api/pagos-trabajadores',auth,async(req,res,next)=>{
  let conn;
  try {
   if (!['administrador_general','administrador_finca','encargado_produccion'].includes(req.user.rol))
    return res.status(403).json({error:'Tu rol no puede registrar gastos.'});
   const {finca,trabajador,modo,referencia,ha,tarifa:tarifaMostrada,fecha}=req.body||{};
   const ids=[finca,trabajador,referencia].map(Number);
   const fechaISO=/^\d{4}-\d{2}-\d{2}$/.test(fecha) && new Date(fecha+'T00:00:00Z');
   if (!ids.every(id=>Number.isSafeInteger(id)&&id>0)||!['lote','tarea'].includes(modo)
    ||!/^\d{1,9}(\.\d{1,3})?$/.test(ha)
    ||Number(ha)<=0||!fechaISO||!Number.isFinite(+fechaISO)||fechaISO.toISOString().slice(0,10)!==fecha)
    return res.status(400).json({error:'Revisa la fecha, las hectáreas, la tarifa y el trabajador.'});
   const permitidas=await farmIds(req.user);
   if(permitidas&&!permitidas.includes(ids[0]))return res.status(403).json({error:'No tienes acceso a esta finca.'});
   conn=await db.getConnection();
   await conn.beginTransaction();
   const [[farm]]=await conn.execute('SELECT tarifa_hectarea FROM fincas WHERE id=? FOR SHARE',[ids[0]]);

   const [[persona]]=await conn.execute('SELECT nombre FROM trabajadores WHERE id=? AND finca_id=?',[ids[1],ids[0]]);
   const consulta=modo==='lote'
    ? 'SELECT id lote_id, nombre, area_hectareas, NULL ciclo_id FROM lotes WHERE id=? AND finca_id=?'
    : 'SELECT a.lote_id,a.titulo nombre,l.area_hectareas,a.ciclo_id FROM actividades a LEFT JOIN lotes l ON l.id=a.lote_id AND l.finca_id=a.finca_id WHERE a.id=? AND a.finca_id=? AND a.trabajador_id=?';
   const [[ref]]=await conn.execute(consulta,modo==='lote'?[ids[2],ids[0]]:[ids[2],ids[0],ids[1]]);
   if(!persona||!ref||(ref.lote_id&&(!ref.area_hectareas||Number(ha)>Number(ref.area_hectareas)))){
    await conn.rollback();
    return res.status(400).json({error:'Revisa la asignación y el área disponible del lote.'});
   }
   const tarifa=modo==='tarea'?tarifaLabor(farm?.tarifa_hectarea,ref.nombre):farm?.tarifa_hectarea;
   if(!farm || Number(tarifa)!==Number(tarifaMostrada)){
    await conn.rollback();
    return res.status(409).json({error:'La tarifa cambió. Vuelve a abrir el formulario para confirmar el total actualizado.'});
   }
   const importe=(BigInt(String(ha).replace('.',''))*10n**BigInt(3-(String(ha).split('.')[1]||'').length)
    *BigInt(String(tarifa).replace('.',''))*10n**BigInt(2-(String(tarifa).split('.')[1]||'').length)+500n)/1000n;
   if(importe<=0n||importe>=10n**16n){await conn.rollback();return res.status(400).json({error:'El total está fuera del rango permitido.'});}
   const valor=(importe/100n)+'.'+String(importe%100n).padStart(2,'0');
   const detalle='Pago por '+modo+' #'+ids[2]+' · '+ref.nombre+' · Trabajador #'+ids[1]+' · '+persona.nombre+' · '+ha+' ha × '+tarifa+' COP/ha';
   const [gasto]=await conn.execute("INSERT INTO gastos(finca_id,lote_id,ciclo_id,fecha,categoria,descripcion,valor,observaciones) VALUES(?,?,?,?,'mano_de_obra',?,?,?)",[ids[0],ref.lote_id,ref.ciclo_id,fecha,'Pago a '+persona.nombre,valor,detalle]);
   await conn.execute("INSERT INTO auditoria(usuario_id,accion,entidad,entidad_id,detalle) VALUES(?,'crear','gastos',?,?)",[req.user.id,gasto.insertId,'Pago por '+modo]);
   await conn.commit();
   res.status(201).json({id:gasto.insertId,valor});
  } catch(error){if(conn)await conn.rollback();next(error)}finally{conn?.release()}
 });
}
