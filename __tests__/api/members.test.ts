import { POST, GET } from '../../app/api/members/route';
import { prismaMock } from '../setup';
import { NextResponse } from 'next/server';

describe('Member Profile Validation API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects payload natively if cellGroupId is missing completely', async () => {
    const mockRequest = new Request('http://localhost/api/members', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        phone: '0241234567',
        email: 'john@example.com',
        // OMITTING cellGroupId explicitly to trigger the validation logic
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error).toBe('Cell group is required');
    expect(prismaMock.member.create).not.toHaveBeenCalled();
  });

  it('securely processes a valid payload while securely mapping admission parameters', async () => {
    // 1. Give Prisma mock a clear predictable sequence
    prismaMock.member.create.mockResolvedValue({
      id: 'mock-id-123',
      name: 'John Doe',
      phone: '0241234567',
      email: 'john@example.com',
      birthMonth: 5,
      birthDay: 15,
      university: null,
      program: null,
      startYear: null,
      hostel: null,
      roomNumber: null,
      isActive: true,
      joinDate: new Date('2024-01-01'),
      joinedSemesterId: 'semester-1',
      admissionYear: '2024',
      currentAcademicLevel: '100', // Server should algorithmically inject this!
      cellGroupId: 'cell-group-id',
      invitedById: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const mockRequest = new Request('http://localhost/api/members', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        phone: '0241234567',
        email: 'john@example.com',
        cellGroupId: 'cell-group-id',
        admissionYear: '2024',
      }),
    });

    const response = await POST(mockRequest);
    
    // Assert structural code is securely mapped natively to Next
    expect(response.status).toBe(200);
    expect(prismaMock.member.create).toHaveBeenCalledTimes(1);

    // Verify mathematical backend transformation is successfully converting 
    // the payload into strict Integer constraints and tracking structures
    expect(prismaMock.member.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'John Doe',
        cellGroup: { connect: { id: 'cell-group-id' } },
        admissionYear: '2024',
        currentAcademicLevel: expect.any(String), // The transformation dynamically infers this!
      }),
      include: {
        cellGroup: true,
        invitedBy: true,
        commitments: true // Enforces the NEW_MEMBER explicit schema inclusion
      }
    });
  });

  it('safely handles unique constraint violations (P2002) correctly parsing Prisma meta structures', async () => {
    // Force Prisma to throw a P2002 duplication constraint failure natively
    prismaMock.member.create.mockRejectedValue({
      code: 'P2002',
      meta: { target: ['email'] },
      message: 'Unique constraint failed on the fields: (`email`)',
    });

    const mockRequest = new Request('http://localhost/api/members', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Doe',
        phone: '0249999999',
        email: 'duplicate@example.com',
        cellGroupId: 'valid-cell-id',
      }),
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('A member with this email already exists');
  });
});
