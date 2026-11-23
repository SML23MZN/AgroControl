import test from 'node:test';
import assert from 'node:assert/strict';
import { LOGIN_LOCK_SECONDS, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_SECONDS, nextFailedLogin } from '../server/login-lockout.js';
import { buildSalesReportQuery, parseReportFilters } from '../server/report-filters.js';

test('bloquea el inicio de sesión al quinto fallo', () => {
  const result = nextFailedLogin({ attempts: LOGIN_MAX_ATTEMPTS - 1, secondsSinceWindowStart: 30 });
  assert.equal(result.blocked, true);
  assert.equal(result.attempts, 5);
  assert.equal(result.remainingSeconds, LOGIN_LOCK_SECONDS);
});

test('permite volver a intentar después de vencer la ventana de fallos', () => {
  const result = nextFailedLogin({ attempts: LOGIN_MAX_ATTEMPTS - 1, secondsSinceWindowStart: LOGIN_WINDOW_SECONDS });
  assert.equal(result.blocked, false);
  assert.equal(result.attempts, 1);
  assert.equal(result.resetWindow, true);
});

test('mantiene el bloqueo durante el tiempo restante', () => {
  const result = nextFailedLogin({ attempts: LOGIN_MAX_ATTEMPTS, secondsSinceWindowStart: 20, secondsBlocked: 47 });
  assert.equal(result.blocked, true);
  assert.equal(result.remainingSeconds, 47);
});

test('acepta fechas de calendario y filtros opcionales de reporte', () => {
  assert.deepEqual(parseReportFilters({ desde: '2026-11-01', hasta: '2026-11-30', cultivo: '4', comprador: '7' }), {
    desde: '2026-11-01', hasta: '2026-11-30', cultivoId: 4, compradorId: 7,
  });
  assert.deepEqual(parseReportFilters({}), { desde: null, hasta: null, cultivoId: null, compradorId: null });
});

test('rechaza fechas imposibles y rangos invertidos', () => {
  assert.throws(() => parseReportFilters({ desde: '2026-02-30' }), /fecha inicial/);
  assert.throws(() => parseReportFilters({ desde: '2026-11-30', hasta: '2026-11-01' }), /anterior o igual/);
});

test('rechaza filtros de comprador o cultivo que no sean identificadores numéricos', () => {
  assert.throws(() => parseReportFilters({ cultivo: '1 OR 1=1' }), /cultivo/);
  assert.throws(() => parseReportFilters({ comprador: '0' }), /comprador/);
});

test('construye consulta de detalle con parámetros y respeta las fincas autorizadas', () => {
  const filters = parseReportFilters({ desde: '2026-11-01', cultivo: '4', comprador: '7' });
  const query = buildSalesReportQuery(filters, [2, 5]);
  assert.match(query.sql, /v\.fecha>=\?/);
  assert.match(query.sql, /c\.id=\?/);
  assert.match(query.sql, /b\.id=\?/);
  assert.match(query.sql, /f\.id IN \(\?\)/);
  assert.deepEqual(query.params, ['2026-11-01', 4, 7, [2, 5]]);
  assert.equal(buildSalesReportQuery(filters, []).sql, null);
});
