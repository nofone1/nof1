/**
 * Pharmacokinetic calculation utilities.
 * Used for dose decay visualization and concentration tracking.
 */

/**
 * Calculate remaining dose percentage after elapsed time using exponential decay.
 * @param halfLifeHours - Half-life in hours
 * @param hoursElapsed - Hours since dose
 * @returns Percentage remaining (0-100)
 */
export function calculateDecay(halfLifeHours: number, hoursElapsed: number): number {
  if (halfLifeHours <= 0 || hoursElapsed < 0) return 0;
  return 100 * Math.pow(0.5, hoursElapsed / halfLifeHours);
}

/**
 * Generate decay curve data points for visualization.
 * @param halfLifeHours - Half-life in hours
 * @param totalHours - Total duration to calculate
 * @param points - Number of data points
 * @returns Array of { hour, percentage } objects
 */
export function generateDecayCurve(
  halfLifeHours: number,
  totalHours: number,
  points: number = 12,
): Array<{ hour: number; percentage: number }> {
  const step = totalHours / (points - 1);
  return Array.from({ length: points }, (_, i) => {
    const hour = step * i;
    return { hour, percentage: calculateDecay(halfLifeHours, hour) };
  });
}

/**
 * Format hours into a human-readable duration string.
 * @param hours - Hours to format
 * @returns Formatted string (e.g., "4 hrs", "2.5 days")
 */
export function formatDuration(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 48) return `${Math.round(hours)} hrs`;
  return `${(hours / 24).toFixed(1)} days`;
}
