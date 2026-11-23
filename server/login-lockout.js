export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_WINDOW_SECONDS = 15 * 60;
export const LOGIN_LOCK_SECONDS = 15 * 60;

export function nextFailedLogin({ attempts = 0, secondsSinceWindowStart = 0, secondsBlocked = 0 } = {}) {
  if (secondsBlocked > 0) {
    return { blocked: true, attempts: Number(attempts), remainingSeconds: Number(secondsBlocked), resetWindow: false };
  }

  const resetWindow = Number(secondsSinceWindowStart) >= LOGIN_WINDOW_SECONDS;
  const nextAttempts = (resetWindow ? 0 : Number(attempts)) + 1;
  const blocked = nextAttempts >= LOGIN_MAX_ATTEMPTS;

  return {
    blocked,
    attempts: nextAttempts,
    remainingSeconds: blocked ? LOGIN_LOCK_SECONDS : 0,
    resetWindow,
  };
}

export function loginLockMessage(seconds) {
  const minutes = Math.max(1, Math.ceil(Number(seconds || LOGIN_LOCK_SECONDS) / 60));
  return `Demasiados intentos fallidos. Espera ${minutes} minuto${minutes === 1 ? '' : 's'} antes de volver a intentarlo.`;
}
