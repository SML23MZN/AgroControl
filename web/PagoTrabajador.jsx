import {tarifaLabor,pagoPrevisto} from '../shared/tarifas.js';
import React, {useState} from 'react';
import DialogHeader from './DialogHeader.jsx';

export default function PagoTrabajador({data, api, close, saved}) {
 const [finca,setFinca]=useState('');
 const [trabajador,setTrabajador]=useState('');
 const [modo,setModo]=useState('lote');
 const [referencia,setReferencia]=useState('');
 const [ha,setHa]=useState('');
 const base=data.fincas.find(row=>String(row.id)===finca)?.tarifa_hectarea??'';
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const mismaFinca=row=>String(row.finca_id)===finca;
 const opciones=modo==='lote'?data.lotes.filter(mismaFinca):data.actividades.filter(row=>mismaFinca(row)&&String(row.trabajador_id)===trabajador);
 const ref=opciones.find(row=>String(row.id)===referencia);
 const lote=modo==='lote'?ref:data.lotes.find(row=>row.id===ref?.lote_id);
 const tarifa=base && (modo==='lote'?base:ref?tarifaLabor(base,ref.titulo):'');
 const total=pagoPrevisto(ha,tarifa);
 async function guardar(e){
  e.preventDefault();
  const fecha=new FormData(e.currentTarget).get('fecha');
  setBusy(true);setError('');
  try{
   await api('/pagos-trabajadores',{method:'POST',body:JSON.stringify({finca,trabajador,modo,referencia,ha,tarifa,fecha})});
   saved();
  }catch(err){setError(err.message)}finally{setBusy(false)}
 }
 return <div className="overlay"><form className="dialog" onSubmit={guardar}><DialogHeader><h2>Registrar pago a trabajador</h2><button type="button" className="close" aria-label="Cerrar" disabled={busy} onClick={close}>×</button></DialogHeader><div className="form-grid">
 <label>Finca<select required value={finca} onChange={e=>{setFinca(e.target.value);setTrabajador('');setReferencia('');setHa('')}}><option value="">Selecciona una finca</option>{data.fincas.map(row=><option key={row.id} value={row.id}>{row.nombre}</option>)}</select></label>
 <label>Trabajador<select required value={trabajador} onChange={e=>{setTrabajador(e.target.value);setReferencia('');setHa('')}}><option value="">Selecciona un trabajador</option>{data.trabajadores.filter(mismaFinca).map(row=><option key={row.id} value={row.id}>{row.nombre}</option>)}</select></label>
 <label>Asignar pago por<select value={modo} onChange={e=>{setModo(e.target.value);setReferencia('');setHa('')}}><option value="lote">Lote</option><option value="tarea">Tarea asignada</option></select></label>
 <label>{modo==='lote'?'Lote trabajado':'Tarea del trabajador'}<select required value={referencia} onChange={e=>{setReferencia(e.target.value);setHa(modo==='tarea'?opciones.find(row=>String(row.id)===e.target.value)?.hectareas_tarea??'':'')}}><option value="">Selecciona…</option>{opciones.map(row=><option key={row.id} value={row.id}>{row.nombre||row.titulo}</option>)}</select></label>
 <label>Hectáreas trabajadas<input required type="number" min="0.001" step="0.001" max={lote?.area_hectareas} value={ha} onChange={e=>setHa(e.target.value)}/></label>
 <label>Tarifa por hectárea (COP)<input readOnly value={tarifa} placeholder="Elige una finca"/></label>
 <label>Fecha del pago<input required name="fecha" type="date"/></label>
 <label>Total del pago<output>{total.toLocaleString('es-CO',{style:'currency',currency:'COP'})}</output></label>
 </div>{error&&<div className="error" role="alert">{error}</div>}<div className="dialog-footer"><button type="button" className="secondary" disabled={busy} onClick={close}>Cancelar</button><button className="primary" disabled={busy}>Registrar pago</button></div></form></div>
}
