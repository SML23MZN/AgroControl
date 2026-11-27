import React,{useEffect,useRef,useState} from 'react';
import ListFilters,{matchesFilters} from './ListFilters.jsx';

const moneda=new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:2});
export default function ReporteGastos({api,labels}){
 const [rows,setRows]=useState(null);
 const [filters,setFilters]=useState({});
 const [search,setSearch]=useState('');
 const [error,setError]=useState('');
 const [revision,reload]=useState(0);
 const request=useRef(api);
 request.current=api;
 useEffect(()=>{
  let mounted=true;
  setError('');
  request.current('/reportes/gastos').then(data=>{if(mounted)setRows(data)})
   .catch(err=>{if(mounted)setError(err.message)});
  return ()=>{mounted=false};
 },[revision]);
 if(error)return <p role="alert">{error} <button onClick={()=>reload(n=>n+1)}>Reintentar</button></p>;
 if(!rows)return <p>Cargando gastos…</p>;
 const needle=search.trim().toLocaleLowerCase('es');
 const items=rows.filter(row=>matchesFilters('gastos',row,filters)&&
  [...(row.tareas||[]).flatMap(t=>[t.titulo,t.trabajador]),row.descripcion,row.observaciones,row.finca,row.lote,labels[row.categoria]].some(value=>String(value??'').toLocaleLowerCase('es').includes(needle)));
 const subtotales=new Map();
 let total=0;
 for(const row of items){
  const cents=Math.round(Number(row.valor)*100);
  total+=cents;
  subtotales.set(row.categoria,(subtotales.get(row.categoria)||0)+cents);
 }
 return <section aria-label="Detalle de gastos">
  <h2>Detalle de gastos</h2>
  <ListFilters page="gastos" rows={rows} labels={labels} filters={filters}
   change={(key,value)=>setFilters(f=>({...f,...(key==='finca'?{lote:''}:{}),[key]:value}))} clear={()=>{setFilters({});setSearch('')}}/>
  <div className="toolbar"><div className="search"><input type="search" aria-label="Buscar gasto" placeholder="Buscar concepto, trabajador o tarea…" value={search} onChange={e=>setSearch(e.target.value)}/></div></div>
  <div className="report-result-summary"><div><strong>{items.length} {items.length===1?'gasto':'gastos'}</strong></div><div><small>Total de gastos filtrados</small><strong>{moneda.format(total/100)}</strong></div></div>
  {!!items.length&&<div className="panel"><h3>Gasto por categoría</h3><dl>{Array.from(subtotales).sort((a,b)=>b[1]-a[1]).map(([key,cents])=><div key={key} style={{display:'flex',justifyContent:'space-between'}}><dt>{labels[key]||key}</dt><dd>{moneda.format(cents/100)}</dd></div>)}</dl></div>}
  <div className="table-wrap"><table><thead><tr>{['Fecha','Finca','Lote','Categoría','Concepto y tareas','Valor (COP)','Detalle'].map(title=><th key={title}>{title}</th>)}</tr></thead><tbody>{items.map(g=><tr key={g.id}>
   <td>{g.fecha}</td><td>{g.finca}</td><td>{g.lote||'Sin lote'}</td><td>{labels[g.categoria]||g.categoria}</td><td><strong>{g.descripcion}</strong>{g.tareas?.map((t,i)=><small className="report-location" key={i}>{t.titulo} · {t.trabajador||'Sin asignar'}</small>)}</td><td>{moneda.format(g.valor)}</td>
   <td>{g.observaciones?<details><summary>Ver detalle</summary><p style={{whiteSpace:'pre-wrap',minWidth:'18rem'}}>{g.observaciones}</p></details>:'—'}</td>
  </tr>)}</tbody></table>{!items.length&&<p className="empty">No hay gastos que coincidan con esta consulta.</p>}</div>
 </section>;
}
