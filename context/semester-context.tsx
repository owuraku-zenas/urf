"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SemesterContextType {
  selectedSemester: string | null;
  setSelectedSemester: (id: string | null) => void;
}

export const SemesterContext = createContext<SemesterContextType>({
  selectedSemester: null,
  setSelectedSemester: () => {},
});

interface Semester {
  id: string;
  status: "ACTIVE" | "CLOSED";
}

interface SemesterProviderProps {
  children: React.ReactNode;
  initialSemester?: string | null;
}

export const SemesterProvider = ({ children, initialSemester }: SemesterProviderProps) => {
  const [selectedSemester, setSelectedSemester] = useState<string | null>(initialSemester || null);

  useEffect(() => {
    const initializeSemester = async () => {
      // 1. Try to recover from local storage first
      const stored = typeof window !== 'undefined' ? localStorage.getItem('urf_selected_semester') : null;
      if (stored) {
        setSelectedSemester(stored);
        return;
      }

      // 2. If no selection, fetch the current active semester as default
      if (!initialSemester) {
        try {
          const res = await fetch("/api/semesters");
          if (res.ok) {
            const semesters: Semester[] = await res.json();
            const active = semesters.find((s) => s.status === "ACTIVE");
            if (active) {
              setSelectedSemester(active.id);
            }
          }
        } catch (err) {
          console.error("Failed to fetch default semester", err);
        }
      }
    };

    initializeSemester();
  }, [initialSemester]);

  useEffect(() => {
    if (selectedSemester) {
      localStorage.setItem('urf_selected_semester', selectedSemester);
    }
  }, [selectedSemester]);

  return (
    <SemesterContext.Provider value={{ selectedSemester, setSelectedSemester }}>
      {children}
    </SemesterContext.Provider>
  );
};

export const useSemester = () => useContext(SemesterContext);
