import { POST } from '../../app/api/semesters/route';
import { dbMock } from '../setup';
import { auth } from '@/auth';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.Mock;

const mockSemester = {
  id: 'existing-1',
  name: 'Overlapping Fall',
  academicYear: '2026/2027',
  startDate: new Date('2026-08-01T00:00:00Z'),
  endDate: new Date('2026-10-01T00:00:00Z'),
  status: 'CLOSED' as const,
  isArchive: false,
  isOldMemberBucket: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('POST /api/semesters', () => {
  beforeEach(() => {
    mockAuth.mockReset();
  });

  const validBody = {
    name: "Fall 2026",
    academicYear: "2026/2027",
    startMonth: 9,
    startYear: 2026,
    endMonth: 12,
    endYear: 2026,
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

  it('returns 409 if dates overlap with an existing semester', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'ADMIN' } });

    const closedBody = { ...validBody, status: 'CLOSED' };

    // Overlap check returns a conflicting semester
    dbMock.semester.findFirst.mockResolvedValueOnce(mockSemester);

    const res = await POST(createRequest(closedBody));
    expect(res.status).toBe(409);
    expect(await res.text()).toContain("Date range overlaps with existing semester");
  });

  it('successfully creates a semester', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'ADMIN' } });

    dbMock.semester.findFirst.mockResolvedValue(null);
    dbMock.semester.updateMany.mockResolvedValue({ count: 0 });
    dbMock.semester.create.mockResolvedValue({
      id: 'new-sem',
      name: validBody.name,
      academicYear: validBody.academicYear,
      startDate: new Date(2026, 8, 1),
      endDate: new Date(2026, 11, 31, 23, 59, 59),
      status: 'ACTIVE',
      isArchive: false,
      isOldMemberBucket: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await POST(createRequest(validBody));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe(validBody.name);

    expect(dbMock.semester.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: validBody.name,
        academicYear: validBody.academicYear,
        status: validBody.status,
      })
    });
  });
});
