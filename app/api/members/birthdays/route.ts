import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const today = new Date();
    // Normalize today to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);

    // We fetch all members tracking birth dates
    const members = await prisma.member.findMany({
      where: {
        birthMonth: { not: null },
        birthDay: { not: null },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        phone: true,
        birthMonth: true,
        birthDay: true,
        cellGroup: {
          select: { name: true }
        }
      }
    });

    const upcomingBirthdays = members.filter(member => {
      if (!member.birthMonth || !member.birthDay) return false;
      
      const memberDate = new Date(today.getFullYear(), member.birthMonth - 1, member.birthDay);
      const diffTime = memberDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // If birthday has passed this year, check next year
      if (diffDays < 0) {
        const nextYearDate = new Date(today.getFullYear() + 1, member.birthMonth - 1, member.birthDay);
        const nextDiffTime = nextYearDate.getTime() - today.getTime();
        const nextDiffDays = Math.ceil(nextDiffTime / (1000 * 60 * 60 * 24));
        return nextDiffDays <= 5; 
      }
      
      return diffDays <= 5; // upcoming within 5 days
    }).sort((a, b) => {
        // sort by nearest
        const aDate = new Date(today.getFullYear(), a.birthMonth! - 1, a.birthDay!);
        const bDate = new Date(today.getFullYear(), b.birthMonth! - 1, b.birthDay!);
        if (aDate < today) aDate.setFullYear(today.getFullYear() + 1);
        if (bDate < today) bDate.setFullYear(today.getFullYear() + 1);
        return aDate.getTime() - bDate.getTime();
    });

    return NextResponse.json(upcomingBirthdays);
  } catch (error) {
    console.error("Error fetching birthdays:", error);
    return NextResponse.json({ error: "Failed to fetch birthdays" }, { status: 500 });
  }
}
