export const STROKE = 24;
export const PERIOD = 8;

export function pressAt(seconds) {
  const phase = ((seconds % PERIOD) + PERIOD) % PERIOD;
  const progress = (1 - Math.cos(2 * Math.PI * phase / PERIOD)) / 2;
  return { progress, travel: STROKE * progress, gap: STROKE * (1 - progress) };
}
