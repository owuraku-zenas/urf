/**
 * Calculate a member's current academic level from their admission year,
 * the month their academic year starts (1-indexed, default 8 = August),
 * and the total years their programme lasts (default 4).
 *
 * Formula: count how many times the start-of-year month has passed since
 * the admission year. Each passage is one completed level.
 *   1 passage → 100, 2 → 200, ..., programDuration → (programDuration * 100)
 *   > programDuration → ALUMNI
 */
export function calculateAcademicLevel(
  admissionYear: string | null | undefined,
  admissionMonth: number = 8,
  programDuration: number = 4
): string | null {
  if (!admissionYear) return null;
  const year = parseInt(admissionYear, 10);
  if (isNaN(year)) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed

  const completedYears =
    (currentYear - year) + (currentMonth >= admissionMonth ? 1 : 0);

  if (completedYears <= 0) return null;
  if (completedYears <= programDuration) return (completedYears * 100).toString();
  return "ALUMNI";
}
