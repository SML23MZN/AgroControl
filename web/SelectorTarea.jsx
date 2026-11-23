import React from 'react';

import {labores,tarifaLabor,pagoPrevisto} from '../shared/tarifas.js';
export const pagoCOP = valor => new Intl.NumberFormat('es-CO', {
 style:'currency', currency:'COP', maximumFractionDigits:2,
}).format(valor);

export function SelectorTarea({original,seleccion,area,tarifa,cambiar}) {
 const opciones = [...new Set([...labores, ...(original ? [original] : [])])];
 return <select name="titulo" required value={seleccion||''} onChange={e=>cambiar(e.target.value)}>
  <option value="">Selecciona la tarea</option>
  {opciones.map(tarea=><option key={tarea} value={tarea}>{tarea}{Number(area)>0 && Number(tarifa)>0 && ' · '+pagoCOP(pagoPrevisto(area,tarifaLabor(tarifa,tarea)))}</option>)}
 </select>;
}
