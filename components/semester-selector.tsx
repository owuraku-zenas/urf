"use client";
import { useEffect, useState } from "react";
import { useSemester } from "../context/semester-context";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { useSession } from "next-auth/react";

interface Semester {
  id: string;
  name: string;
  status: "ACTIVE" | "CLOSED";
}

export function SemesterSelector() {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const { selectedSemester, setSelectedSemester } = useSemester();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    async function fetchSemesters() {
      const res = await fetch("/api/semesters");
      if (res.ok) setSemesters(await res.json());
    }
    fetchSemesters();
  }, []);

  const visibleSemesters = semesters;

  return (
    <Select value={selectedSemester || ""} onValueChange={setSelectedSemester}>
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="Select Semester" />
      </SelectTrigger>
      <SelectContent>
        {isAdmin && <SelectItem value="all">All Semesters</SelectItem>}
        {visibleSemesters.map(s => (
          <SelectItem key={s.id} value={s.id}>
            {s.name} {s.status === "ACTIVE" ? "(Active)" : "(Closed)"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
