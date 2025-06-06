import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, context: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, role } = await request.json();
  const updatedUser = await prisma.user.update({
    where: { id: context.params.id },
    data: { name, email, role },
  });

  return NextResponse.json(updatedUser);
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.user.delete({
    where: { id: context.params.id },
  });

  return NextResponse.json({ message: 'User deleted successfully' });
} 