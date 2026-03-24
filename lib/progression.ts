/**
 * Infers a member's current academic level based on their admission year and the current academic year.
 * 
 * @param admissionYear The year the member was admitted (e.g., "2024")
 * @param currentAcademicYear The current academic year (e.g., "2024/2025" or "2024")
 * @returns The inferred academic level (e.g., "100", "200", "ALUMNI", etc.) or null if invalid
 */
export function calculateAcademicLevel(
  admissionYear: string | null | undefined,
  currentAcademicYear: string | null | undefined
): string | null {
  if (!admissionYear || !currentAcademicYear) return null;

  const admission = parseInt(admissionYear, 10);
  
  // Handle formats like "2024/2025" by taking the first year
  const currentYearStr = currentAcademicYear.includes('/') 
    ? currentAcademicYear.split('/')[0] 
    : currentAcademicYear;
    
  const current = parseInt(currentYearStr, 10);

  if (isNaN(admission) || isNaN(current)) return null;

  const diff = current - admission;

  if (diff < 0) return null; // Admission year is in the future
  
  switch (diff) {
    case 0: return "100";
    case 1: return "200";
    case 2: return "300";
    case 3: return "400";
    case 4: return "500";
    case 5: return "600";
    default: return "ALUMNI";
  }
}
