export const CURRENT_APP_VERSION = '1.0.3';

/**
 * Compare two semver string versions (e.g. '1.0.0' vs '1.0.2').
 * Returns:
 *   -1 if v1 < v2
 *    0 if v1 === v2
 *    1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = (v1 || '0').split('.').map((n) => parseInt(n, 10) || 0);
  const parts2 = (v2 || '0').split('.').map((n) => parseInt(n, 10) || 0);
  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
}
