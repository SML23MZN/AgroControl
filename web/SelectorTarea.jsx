import React from 'react';

const labores = [
 'Inspección de drenajes', 'Limpieza de drenajes', 'Control de malezas',
 'Deshoja sanitaria', 'Deshije', 'Fertilización', 'Embolse de racimos',
 'Amarre de plantas', 'Corte y recolección de racimos',
];
export const pagoCOP = valor => new Intl.NumberFormat('es-CO', {
 style:'currency', currency:'COP', maximumFractionDigits:2,
}).format(valor);

export function SelectorTarea({original,seleccion,area,tarifa,cambiar}) {
 const opciones = [...new Set([...labores, ...(original ? [original] : [])])];
 const importe = Number(area)>0 && Number(tarifa)>0 ? pagoCOP(area*tarifa) : '';
 return <select name="titulo" required value={seleccion||''} onChange={e=>cambiar(e.target.value)}>
  <option value="">Selecciona la tarea</option>
  {opciones.map(tarea=><option key={tarea} value={tarea}>{tarea}{importe && ' · '+importe}</option>)}
 </select>;
}
