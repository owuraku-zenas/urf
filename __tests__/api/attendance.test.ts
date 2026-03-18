import { POST } from '../../app/api/attendance/route';
import { prismaMock } from '../setup';
import * as commitment from '@/lib/commitment';

jest.mock('@/lib/commitment', () => ({
  calculateMemberCommitment: jest.fn().mockResolvedValue(undefined),
}));

describe('/api/attendance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) => new Request('http://localhost:3000/api/attendance', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  describe('POST', () => {
    it('returns 400 if missing eventId or memberId', async () => {
      const res = await POST(createRequest({ eventId: '123' }));
      expect(res.status).toBe(400);
    });

    it('returns 404 if event is not found', async () => {
      prismaMock.event.findUnique.mockResolvedValue(null);
      const res = await POST(createRequest({ eventId: 'nonexistent', memberId: 'mem-1' }));
      expect(res.status).toBe(404);
    });

    it('creates attendance, updates active status, and triggers commitment calculation', async () => {
      // 1. Mock Event lookup
      prismaMock.event.findUnique.mockResolvedValue({
        id: 'evt-1', semesterId: 'sem-1',
      } as any);

      // 2. Mock Attendance creation
      prismaMock.attendance.create.mockResolvedValue({
        id: 'att-1', eventId: 'evt-1', memberId: 'mem-1', status: 'PRESENT'
      } as any);

      // 3. Mock Active count query (returning 5 to trigger active status)
      prismaMock.attendance.count.mockResolvedValue(5);

      // 4. Mock Member update
      prismaMock.member.update.mockResolvedValue({} as any);

      const res = await POST(createRequest({ eventId: 'evt-1', memberId: 'mem-1' }));
      expect(res.status).toBe(200);

      // Assert member isActive updated to true
      expect(prismaMock.member.update).toHaveBeenCalledWith({
        where: { id: 'mem-1' },
        data: { isActive: true }
      });

      // Assert legacy async function was called
      expect(commitment.calculateMemberCommitment).toHaveBeenCalledWith('mem-1', 'sem-1');
    });
  });
});
