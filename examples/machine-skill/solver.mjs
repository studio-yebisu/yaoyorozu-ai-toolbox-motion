// Studio Yebisu, MIT. Geometry and a zero-dimensional compressor model, SI units.
export const SPEC = Object.freeze({
  bore: 0.036, stroke: 0.030, rod: 0.055, clearance: 0.06,
  inletPa: 101325, outletGaugePa: 620000, inletK: 293.15,
  exponent: 1.3, mechanicalEfficiency: 0.84, referenceRpm: 1400,
  // Tank: cylindrical straight section and two hemispherical end caps.
  tankRadius: 0.080, tankStraight: 0.27133,
});

export function pistonAt(angle, spec = SPEC) {
  const r = spec.stroke / 2;
  const crankX = r * Math.sin(angle), crankY = r * Math.cos(angle);
  const pinY = crankY + Math.sqrt(spec.rod ** 2 - crankX ** 2);
  return { crankX, crankY, pinY, travel: r + spec.rod - pinY };
}

export function compressor(rpm, angle = 0, failed = false, spec = SPEC) {
  const n = Math.max(0, rpm), area = Math.PI * spec.bore ** 2 / 4;
  const swept = area * spec.stroke, clearance = swept * spec.clearance;
  const p1 = spec.inletPa, p2 = p1 + spec.outletGaugePa, ratio = p2 / p1;
  const volumetricEfficiency = failed ? 0 : Math.max(0, 1 + spec.clearance - spec.clearance * ratio ** (1 / spec.exponent));
  const flowLmin = swept * n * volumetricEfficiency * 1000;
  const gasW = spec.exponent / (spec.exponent - 1) * p1 * (flowLmin / 60000)
    * (ratio ** ((spec.exponent - 1) / spec.exponent) - 1);
  const powerW = n === 0 ? 0 : gasW / spec.mechanicalEfficiency + 18 * (n / spec.referenceRpm);
  const geometry = pistonAt(angle, spec), volume = clearance + area * geometry.travel;
  const phase = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  // Four branches of an ideal p-V cycle: re-expansion, intake, compression, discharge.
  const rawPressure = phase <= Math.PI ? p2 * (clearance / volume) ** spec.exponent
    : p1 * ((clearance + swept) / volume) ** spec.exponent;
  const pressurePa = failed ? p1 : Math.max(p1, Math.min(p2, rawPressure));
  const inletOpen = failed || (phase <= Math.PI && rawPressure <= p1);
  const outletOpen = !failed && phase > Math.PI && rawPressure >= p2;
  const outletK = failed ? spec.inletK : spec.inletK * ratio ** ((spec.exponent - 1) / spec.exponent);
  const tankL = (Math.PI * spec.tankRadius ** 2 * spec.tankStraight
    + 4 / 3 * Math.PI * spec.tankRadius ** 3) * 1000;
  return { ...geometry, area, swept, volume, flowLmin, powerW, volumetricEfficiency,
    pressurePa, pressureGaugeBar: (pressurePa - p1) / 100000,
    inletOpen, outletOpen, outletK, tankL, rpm: n };
}
