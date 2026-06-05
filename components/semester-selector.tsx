"use client";
import { useEffect, useState } from "react";
import { useSemester } from "../context/semester-context";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";

interface Semester {
  id: string;
  name: string;
  status: "ACTIVE" | "CLOSED";
}

export function SemesterSelector() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const { selectedSemester, setSelectedSemester } = useSemester();

  useEffect(() => {
    async function fetchSemesters() {
      const res = await fetch("/api/semesters");
      if (res.ok) setSemesters(await res.json());
    }
    fetchSemesters();
  }, []);

  return (
    <Select value={selectedSemester || ""} onValueChange={setSelectedSemester}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select Semester" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Semesters</SelectItem>
        {semesters.map(s => (
          <SelectItem key={s.id} value={s.id}>
            {s.name} {s.status === "ACTIVE" ? "(Active)" : "(Closed)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
