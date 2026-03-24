import { calculateAcademicLevel } from '../lib/progression';

describe('calculateAcademicLevel', () => {
  it('returns 100 for admission year equal to current academic year', () => {
    expect(calculateAcademicLevel("2024", "2024")).toBe("100");
    expect(calculateAcademicLevel("2024", "2024/2025")).toBe("100"); // Handles slash format
  });

  it('calculates progressing levels correctly', () => {
    expect(calculateAcademicLevel("2023", "2024")).toBe("200");
    expect(calculateAcademicLevel("2022", "2024")).toBe("300");
    expect(calculateAcademicLevel("2021", "2024")).toBe("400");
    expect(calculateAcademicLevel("2020", "2024")).toBe("500");
    expect(calculateAcademicLevel("2019", "2024")).toBe("600");
  });

  it('returns ALUMNI for students past 6 years', () => {
    expect(calculateAcademicLevel("2018", "2024")).toBe("ALUMNI");
    expect(calculateAcademicLevel("2010", "2024")).toBe("ALUMNI");
  });

  it('returns null if admission year is in the future', () => {
    expect(calculateAcademicLevel("2025", "2024")).toBeNull();
  });

  it('handles null, empty, or invalid inputs safely', () => {
    expect(calculateAcademicLevel(null, "2024")).toBeNull();
    expect(calculateAcademicLevel("2024", undefined)).toBeNull();
    expect(calculateAcademicLevel("", "2024")).toBeNull();
    expect(calculateAcademicLevel("invalid", "2024")).toBeNull();
  });
});
