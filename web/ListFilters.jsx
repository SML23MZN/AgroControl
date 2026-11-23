import React from 'react';

const fields = {
 fincas:['ubicacion','activa'], lotes:['finca','activo'], trabajadores:['finca','activo'],
 cultivos:['finca','lote','nombre','variedad','activo'], ciclos:['finca','cultivo','estado'],
 actividades:['finca','lote','trabajador','estado'], cosechas:['finca','lote','cultivo','unidad'],
 compradores:['finca','activo'], ventas:['finca','comprador','cultivo'], gastos:['finca','lote','categoria'],
 usuarios:['rol','activo'], auditoria:['usuario','accion','entidad'],
};
const dateFields = {ciclos:'fecha_inicio',actividades:'fecha_programada',cosechas:'fecha',ventas:'fecha',gastos:'fecha',auditoria:'fecha_hora'};
const names = {ubicacion:'Ubicación', activa:'Estado', activo:'Estado', finca:'Finca', lote:'Lote', nombre:'Cultivo', variedad:'Variedad', cultivo:'Cultivo', estado:'Estado', trabajador:'Responsable', unidad:'Unidad', comprador:'Comprador', categoria:'Categoría', rol:'Rol', usuario:'Usuario', accion:'Acción', entidad:'Módulo'};

export function matchesFilters(page,row,filters) {
 for(const key of fields[page]||[]){
  if(filters[key] && String(row[key]??'')!==filters[key]) return false;
 }
 const day=String(row[dateFields[page]]??'').slice(0,10);
 return (!filters.desde || day>=filters.desde) && (!filters.hasta || (!!day && day<=filters.hasta));
}

export default function ListFilters({page,rows,filters,change,clear,labels}) {
 if(!fields[page]) return null;
 const active=Object.values(filters).some(Boolean);
 function caption(key,value){
  if(key==='activo'||key==='activa') return value==='1'?'Activo':'Inactivo';
  return labels[value]||value.replaceAll('_',' ');
 }
 return <div className="report-filters list-filters" role="group" aria-label="Filtrar registros">
  {fields[page].map(key=>{
   const source=key==='lote'&&filters.finca?rows.filter(row=>row.finca===filters.finca):rows;
   const values=[...new Set(source.map(row=>String(row[key]??'')).filter(Boolean))];
   values.sort((a,b)=>caption(key,a).localeCompare(caption(key,b),'es',{numeric:true}));
   return <label key={key}>{names[key]}<select value={filters[key]||''} onChange={e=>change(key,e.target.value)}>
    <option value="">Todos</option>{values.map(v=><option key={v} value={v}>{caption(key,v)}</option>)}
   </select></label>;
  })}
  {dateFields[page]&&<><label>Desde<input type="date" max={filters.hasta||undefined} value={filters.desde||''} onChange={e=>change('desde',e.target.value)}/></label>
  <label>Hasta<input type="date" min={filters.desde||undefined} value={filters.hasta||''} onChange={e=>change('hasta',e.target.value)}/></label></>}
  {filters.desde>filters.hasta&&filters.hasta&&<span role="alert">La fecha final debe ser igual o posterior a la inicial.</span>}
  <button className="secondary" type="button" disabled={!active} onClick={clear}>Limpiar filtros</button>
 </div>;
}
