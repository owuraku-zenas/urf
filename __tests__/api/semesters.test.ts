import { POST } from '../../app/api/semesters/route';
import { dbMock } from '../setup';
import { auth } from '@/auth';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.Mock;

describe('POST /api/semesters', () => {
  beforeEach(() => {
    mockAuth.mockReset();
  });

  const validBody = {
    name: "Fall 2026",
    academicYear: "2026/2027",
    startDate: "2026-09-01T00:00:00Z",
    endDate: "2026-12-15T00:00:00Z",
    status: "ACTIVE"
  };

  const createRequest = (body: any) => {
    return new Request('http://localhost:3000/api/semesters', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  };

  it('returns 401 if user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(createRequest(validBody));
    expect(res.status).toBe(401);
  });

  it('returns 401 if user is not an ADMIN', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'USER' } });
    const res = await POST(createRequest(validBody));
    expect(res.status).toBe(401);
  });

  // The 'returns 409 if trying to create an ACTIVE semester' test is removed.
  // The backend now securely auto-closes the active semester with `updateMany`
  // mapping implicitly preventing overlaps.
  it('returns 409 if dates overlap with an existing semester', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'ADMIN' } });
    
    // First findFirst (active check) returns null because we will attempt to create a CLOSED semester
    const closedBody = { ...validBody, status: 'CLOSED' };
    
    // Second findFirst (overlap check) returns an overlapping semester
    dbMock.semester.findFirst.mockResolvedValueOnce({
      id: 'existing-1',
      name: 'Overlapping Fall',
      academicYear: '2026/2027',
      startDate: new Date('2026-08-01T00:00:00Z'),
      endDate: new Date('2026-10-01T00:00:00Z'),
      status: 'CLOSED',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const res = await POST(createRequest(closedBody));
    expect(res.status).toBe(409);
    expect(await res.text()).toContain("Date range overlaps with existing semester");
  });

  it('successfully creates a semester', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'ADMIN' } });
    
    // Both findFirst checks return null (no active, no overlap)
    dbMock.semester.findFirst.mockResolvedValue(null);
    
    dbMock.semester.create.mockResolvedValue({
      id: 'new-sem',
      ...validBody,
      startDate: new Date(validBody.startDate).toISOString(),
      endDate: new Date(validBody.endDate).toISOString(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as any);

    const res = await POST(createRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe(validBody.name);
    
    expect(dbMock.semester.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: validBody.name,
        academicYear: validBody.academicYear,
        status: validBody.status
      })
    });
  });
});
