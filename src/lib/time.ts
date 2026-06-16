// Epoch-millis time helpers. No date library.

/** Duration like "1h 23m" or "4m 12s" from a millisecond span. */
export function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const clockFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
});

/** Wall-clock time of an epoch-ms timestamp, e.g. "14:05". */
export function formatClock(epochMs: number): string {
  return clockFormatter.format(new Date(epochMs));
}
