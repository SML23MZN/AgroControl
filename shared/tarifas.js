// Porcentajes académicos de la tarifa base por hectárea de la finca.
const porcentajes = new Map([
 ['Inspección de drenajes', 60], ['Limpieza de drenajes', 130],
 ['Control de malezas', 100], ['Deshoja sanitaria', 85],
 ['Deshije', 110], ['Fertilización', 95], ['Embolse de racimos', 115],
 ['Amarre de plantas', 90], ['Corte y recolección de racimos', 150],
]);
export const labores = [...porcentajes.keys()];
export function tarifaLabor(base, tarea) {
 const centavos = Math.round(Number(base) * 100);
 return Math.round(centavos * (porcentajes.get(tarea) ?? 100) / 100) / 100;
}
export function pagoPrevisto(area, tarifa) {
 const milesimas = BigInt(Math.round(Number(area) * 1000));
 const centavos = BigInt(Math.round(Number(tarifa) * 100));
 return Number((milesimas * centavos + 500n) / 1000n) / 100;
}
