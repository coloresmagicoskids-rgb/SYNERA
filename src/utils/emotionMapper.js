export function mapIntensityToLabel(intensity) {
  if (intensity === 1) return "Suave";
  if (intensity === 3) return "Alta";
  return "Media";
}
