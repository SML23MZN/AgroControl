import React,{useEffect,useRef,useState} from 'react';
import ListFilters,{matchesFilters} from './ListFilters.jsx';
import {pagoCOP} from './SelectorTarea.jsx';

export default function ReporteTareas({api,labels}){
 const [rows,setRows]=useState(null),[filters,setFilters]=useState({}),[search,setSearch]=useState('');
 const [error,setError]=useState(''),[revision,setRevision]=useState(0);
 const request=useRef(api);
 request.current=api;
 useEffect(()=>{
  let active=true;
  setError('');
  request.current('/reportes/tareas').then(data=>{if(active)setRows(data)}).catch(err=>{if(active)setError(err.message)});
  return ()=>{active=false};
 },[revision]);
 if(error)return <p role="alert">{error} <button onClick={()=>setRevision(n=>n+1)}>Reintentar</button></p>;
 if(!rows)return <p>Cargando tareas…</p>;
 const items=rows.filter(row=>matchesFilters('actividades',row,filters)&&row.titulo.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es')));
 const estimadas=items.filter(t=>t.pago_previsto!=null&&t.estado!=='cancelada');
 const total=estimadas.reduce((s,t)=>s+Math.round(t.pago_previsto*100),0)/100;
 return <section className="task-report"><h2>Detalle de tareas</h2>
 <ListFilters page="actividades" labels={labels} rows={rows} filters={filters} change={(key,value)=>setFilters(f=>({...f,...(key==='finca'?{lote:''}:{}),[key]:value}))} clear={()=>{setSearch('');setFilters({})}}/>
 <div className="toolbar"><div className="search"><input type="search" aria-label="Buscar tarea" placeholder="Buscar por nombre de tarea…" value={search} onChange={e=>setSearch(e.target.value)}/></div></div>
 <div className="task-metrics">
 <div className="panel"><small>Tareas en la consulta</small><strong>{items.length}</strong></div>
 <div className="panel"><small>Finalizadas</small><strong>{items.filter(t=>t.estado==='finalizada').length}</strong></div>
 <div className="panel"><small>Pago previsto · {estimadas.length} labores con importe</small><strong>{pagoCOP(total)}</strong></div>
 </div>
 {items.length?<div className="table-wrap"><table><thead><tr>{['Labor y lote','Responsable','Programada','Estado','Área','Pago previsto'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>
 {items.map(t=><tr key={t.id}><td><strong>{t.titulo}</strong><small className="report-location">{[t.finca,t.lote].filter(Boolean).join(' · ')}</small></td><td>{t.trabajador||'Sin asignar'}</td><td>{t.fecha_programada}</td><td><span className={'task-status '+t.estado}>{labels[t.estado]||t.estado}</span></td><td>{t.hectareas_tarea==null?'Sin registrar':t.hectareas_tarea+' ha'}</td><td>{t.pago_previsto==null?'Por calcular':pagoCOP(t.pago_previsto)}</td></tr>)}
 </tbody></table></div>:<p className="panel">No hay tareas que coincidan con los filtros.</p>}
 </section>;
}
