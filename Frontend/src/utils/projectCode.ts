/**
 * Génère un code de projet unique et lisible à partir de son nom.
 * Ex: "Refonte Dashboard Client" -> "REFONTE-DASHBOARD-X7K2"
 */
export function generateProjectCode(nom: string): string {
  const slug = nom
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève les accents
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 12);
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${slug}-${suffix}`;
}