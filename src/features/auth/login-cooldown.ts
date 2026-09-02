export function getLoginCooldownDeadline(
  retryAfterSeconds: number,
  nowMs = Date.now(),
) {
  if (!Number.isFinite(retryAfterSeconds) || retryAfterSeconds <= 0) return null;
  return nowMs + Math.ceil(retryAfterSeconds) * 1000;
}

export function getLoginCooldownRemainingSeconds(
  deadlineMs: number | null,
  nowMs = Date.now(),
) {
  if (deadlineMs === null || !Number.isFinite(deadlineMs)) return 0;
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}
