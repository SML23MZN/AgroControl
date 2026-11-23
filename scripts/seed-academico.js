import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agrocontrol',
});

const fincas = [
  {
    nombre: 'Finca El Guayacán', ubicacion: 'Carepa, Antioquia · Vereda Zungo Abajo', area: 42.5,
    descripcion: 'Unidad productiva de banano y plátano con manejo de drenajes y seguimiento por lote.',
    lotes: [
      { nombre: 'Banano Norte', area: 14.2, cultivo: 'banano', variedad: 'Cavendish Williams' },
      { nombre: 'Banano Sur', area: 12.8, cultivo: 'banano', variedad: 'Valery' },
      { nombre: 'Plátano La Vega', area: 8.5, cultivo: 'plátano', variedad: 'Hartón' },
    ],
    trabajadores: [
      ['Andrés Felipe Ríos', 'ACAD-CAR-001'], ['María Camila Perea', 'ACAD-CAR-002'], ['Jhon Jairo Mena', 'ACAD-CAR-003'],
    ], comprador: 'Comercializadora Frutos del Golfo', cosechas: [
      { lote: 'Banano Norte', cantidad: 18400, precio: 1680 }, { lote: 'Plátano La Vega', cantidad: 6200, precio: 2450 },
    ],
  },
  {
    nombre: 'Finca La Ilusión', ubicacion: 'Chigorodó, Antioquia · Vereda El Vijao', area: 36.8,
    descripcion: 'Finca familiar con lotes diferenciados para banano de exportación y banano manzano.',
    lotes: [
      { nombre: 'Lote La Esperanza', area: 15.6, cultivo: 'banano', variedad: 'Cavendish Valery' },
      { nombre: 'Lote Manzano', area: 7.4, cultivo: 'banano_manzano', variedad: 'Manzano local' },
      { nombre: 'Lote El Mango', area: 6.2, cultivo: 'plátano', variedad: 'Hartón' },
    ],
    trabajadores: [
      ['Luis Eduardo Córdoba', 'ACAD-CHI-001'], ['Diana Marcela Cuesta', 'ACAD-CHI-002'], ['Wilmer Antonio Palacios', 'ACAD-CHI-003'],
    ], comprador: 'Abastecimientos Urabá S.A.S.', cosechas: [
      { lote: 'Lote La Esperanza', cantidad: 21300, precio: 1720 }, { lote: 'Lote Manzano', cantidad: 3850, precio: 3150 },
    ],
  },
  {
    nombre: 'Finca El Porvenir', ubicacion: 'Turbo, Antioquia · Corregimiento El Tres', area: 51.3,
    descripcion: 'Producción diversificada con banano, plátano Hartón y registro de labores por ciclo.',
    lotes: [
      { nombre: 'Lote Horizonte', area: 18.7, cultivo: 'banano', variedad: 'Cavendish Williams' },
      { nombre: 'Lote El Caimán', area: 13.1, cultivo: 'plátano', variedad: 'Hartón' },
      { nombre: 'Lote Primavera', area: 10.4, cultivo: 'banano_manzano', variedad: 'Manzano local' },
    ],
    trabajadores: [
      ['Carlos Alberto Mosquera', 'ACAD-TUR-001'], ['Yurleidis Romaña', 'ACAD-TUR-002'], ['Óscar Darío Hinestroza', 'ACAD-TUR-003'],
    ], comprador: 'Mercados Campesinos del Darién', cosechas: [
      { lote: 'Lote Horizonte', cantidad: 19600, precio: 1650 }, { lote: 'Lote El Caimán', cantidad: 7800, precio: 2380 },
    ],
  },
];

try {
  const [[existing]] = await db.query("SELECT COUNT(*) AS total FROM fincas WHERE nombre IN ('Finca El Guayacán','Finca La Ilusión','Finca El Porvenir')");
  if (Number(existing.total) > 0) {
    console.log('El conjunto académico ya está cargado; no se modificó la información existente.');
    process.exitCode = 0;
  } else {
    await db.beginTransaction();
    for (const finca of fincas) {
      const [fincaResult] = await db.execute(
        'INSERT INTO fincas(nombre,ubicacion,area_hectareas,descripcion) VALUES(?,?,?,?)',
        [finca.nombre, finca.ubicacion, finca.area, finca.descripcion],
      );
      const fincaId = fincaResult.insertId;
      const trabajadores = [];
      for (const [nombre, documento] of finca.trabajadores) {
        const [result] = await db.execute(
          'INSERT INTO trabajadores(finca_id,nombre,documento,telefono,correo) VALUES(?,?,?,?,?)',
          [fincaId, nombre, documento, '', ''],
        );
        trabajadores.push(result.insertId);
      }
      const lotes = new Map();
      const cultivos = new Map();
      for (const lote of finca.lotes) {
        const [loteResult] = await db.execute(
          'INSERT INTO lotes(finca_id,nombre,area_hectareas,descripcion) VALUES(?,?,?,?)',
          [fincaId, lote.nombre, lote.area, `Área productiva de ${lote.cultivo} para el ciclo agrícola vigente.`],
        );
        lotes.set(lote.nombre, loteResult.insertId);
        const [cultivoResult] = await db.execute(
          'INSERT INTO cultivos(lote_id,nombre,variedad,descripcion) VALUES(?,?,?,?)',
          [loteResult.insertId, lote.cultivo, lote.variedad, `Cultivo establecido en ${lote.nombre}.`],
        );
        cultivos.set(lote.nombre, cultivoResult.insertId);
      }
      const ciclos = new Map();
      for (const [index, lote] of finca.lotes.entries()) {
        const [cicloResult] = await db.execute(
          'INSERT INTO ciclos_agricolas(cultivo_id,fecha_inicio,fecha_fin,estado,notas) VALUES(?,?,?,?,?)',
          [cultivos.get(lote.nombre), '2026-01-15', null, 'activo', `Ciclo 2026 de ${lote.variedad}; seguimiento por lote.`],
        );
        ciclos.set(lote.nombre, cicloResult.insertId);
        await db.execute(
          'INSERT INTO actividades(finca_id,lote_id,ciclo_id,trabajador_id,titulo,descripcion,fecha_programada,estado,observaciones) VALUES(?,?,?,?,?,?,?,?,?)',
          [fincaId, lotes.get(lote.nombre), cicloResult.insertId, trabajadores[index % trabajadores.length], 'Inspección de drenajes', 'Recorrer canales, revisar puntos de empozamiento y registrar novedades del lote.', '2026-11-16', 'pendiente', 'Registrar sectores que requieran limpieza antes de la próxima lluvia.'],
        );
        await db.execute(
          'INSERT INTO actividades(finca_id,lote_id,ciclo_id,trabajador_id,titulo,descripcion,fecha_programada,estado,observaciones) VALUES(?,?,?,?,?,?,?,?,?)',
          [fincaId, lotes.get(lote.nombre), cicloResult.insertId, trabajadores[(index + 1) % trabajadores.length], 'Deshoja sanitaria', 'Retiro de hojas secas o afectadas y revisión visual de plantas.', '2026-11-10', 'finalizada', 'Labor registrada en el recorrido semanal.'],
        );
      }
      const [buyerResult] = await db.execute(
        'INSERT INTO compradores(finca_id,nombre,identificacion,telefono,correo,direccion) VALUES(?,?,?,?,?,?)',
        [fincaId, finca.comprador, '', '', '', finca.ubicacion],
      );
      let cosechaIndex = 0;
      for (const cosecha of finca.cosechas) {
        const cicloId = ciclos.get(cosecha.lote);
        const fechaCosecha = `2026-11-${String(4 + cosechaIndex * 3).padStart(2, '0')}`;
        const [harvestResult] = await db.execute(
          'INSERT INTO cosechas(ciclo_id,fecha,cantidad,unidad,observaciones) VALUES(?,?,?,?,?)',
          [cicloId, fechaCosecha, cosecha.cantidad, 'kg', 'Registro de corte y pesaje de la jornada; cantidad de referencia para ejercicio académico.'],
        );
        const vendido = Math.round(cosecha.cantidad * 0.78);
        await db.execute(
          'INSERT INTO ventas(cosecha_id,comprador_id,fecha,cantidad,unidad,precio_unitario,total,observaciones) VALUES(?,?,?,?,?,?,?,?)',
          [harvestResult.insertId, buyerResult.insertId, `2026-11-${String(6 + cosechaIndex * 3).padStart(2, '0')}`, vendido, 'kg', cosecha.precio, Number((vendido * cosecha.precio).toFixed(2)), 'Entrega parcial de la cosecha; valores ilustrativos para práctica de registro.'],
        );
        cosechaIndex++;
      }
      for (const [index, gasto] of [
        ['mano_de_obra', 'Jornales de mantenimiento y deshoja', 1850000],
        ['insumos_utilizados', 'Fertilizante y correctivo de suelo', 2475000],
        ['transporte', 'Traslado de fruta al punto de acopio', 690000],
      ].entries()) {
        const lote = finca.lotes[index % finca.lotes.length];
        await db.execute(
          'INSERT INTO gastos(finca_id,lote_id,ciclo_id,fecha,categoria,descripcion,valor,observaciones) VALUES(?,?,?,?,?,?,?,?)',
          [fincaId, lotes.get(lote.nombre), ciclos.get(lote.nombre), `2026-11-${String(5 + index * 4).padStart(2, '0')}`, gasto[0], gasto[1], gasto[2] + fincas.indexOf(finca) * 125000, 'Valor de referencia para ejercicio universitario; no corresponde a una factura real.'],
        );
      }
    }
    await db.commit();
    console.log('Datos académicos agregados: 3 fincas y sus lotes, cultivos, ciclos, labores, cosechas, compradores, ventas y gastos.');
    console.log('La información es ficticia, verosímil y destinada a demostración universitaria.');
  }
} catch (error) {
  await db.rollback();
  console.error('No se pudieron cargar los datos académicos:', error.message);
  process.exitCode = 1;
} finally {
  await db.end();
}
