import React from 'react';
import {pagoCOP} from './SelectorTarea.jsx';

export default function ResumenTrabajador({stats,error,onActivities}) {
 const tareas=stats?.tareas_asignadas;
 return <section className="content">
  <div className="welcome"><div><h1>Mis tareas pendientes</h1>
   <p>Labores asignadas a ti que están pendientes o en proceso.</p></div>
   <button className="secondary" onClick={onActivities}>Ver mis actividades</button>
  </div>
  {error?<p role="alert">No se pudieron cargar tus tareas.</p>:!tareas?<p>Cargando tus tareas…</p>:tareas.length===0?
   <p className="panel">No tienes tareas pendientes asignadas.</p>:
   <div className="table-wrap"><table><thead><tr>
    {['Tarea','Finca / lote','Fecha programada','Estado','Área','Pago previsto'].map(t=><th key={t}>{t}</th>)}
   </tr></thead><tbody>{tareas.map(t=><tr key={t.id}>
    <td>{t.titulo}</td><td>{[t.finca,t.lote].filter(Boolean).join(' · ')}</td>
    <td>{t.fecha_programada}</td><td>{t.estado==='pendiente'?'Pendiente':'En proceso'}</td>
    <td>{t.hectareas_tarea==null?'Sin registrar':t.hectareas_tarea+' ha'}</td>
    <td>{t.pago_previsto==null?'Por calcular':pagoCOP(t.pago_previsto)}</td>
   </tr>)}</tbody></table></div>}
 </section>;
}
