import { GET, POST } from '../../app/api/events/route';
import { prismaMock } from '../setup';
import { auth } from '@/auth';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.Mock;

describe('/api/events', () => {
  beforeEach(() => {
    mockAuth.mockReset();
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('filters by semesterId when provided', async () => {
      const mockEvents = [
        { id: '1', name: 'Event 1', semesterId: 'sem-1' }
      ];
      prismaMock.event.findMany.mockResolvedValue(mockEvents as any);

      const req = new Request('http://localhost:3000/api/events?semesterId=sem-1');
      const res = await GET(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(mockEvents);

      expect(prismaMock.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { semesterId: 'sem-1' }
      }));
    });

    it('does not filter by semesterId when not provided', async () => {
      prismaMock.event.findMany.mockResolvedValue([]);

      const req = new Request('http://localhost:3000/api/events');
      const res = await GET(req);

      expect(res.status).toBe(200);

      expect(prismaMock.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: undefined
      }));
    });
  });

  describe('POST', () => {
    const validBody = {
      name: "Sunday Service",
      type: "SUNDAY",
      date: "2026-10-10T10:00:00Z",
      semesterId: "sem-1"
    };

    const createRequest = (body: any) => new Request('http://localhost:3000/api/events', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    it('returns 403 if user is not authorized', async () => {
      mockAuth.mockResolvedValue({ user: { role: 'USER' } });
      const res = await POST(createRequest(validBody));
      expect(res.status).toBe(403);
    });

    it('successfully captures semesterId on creation', async () => {
      mockAuth.mockResolvedValue({ user: { role: 'ADMIN' } });
      
      const mockCreated = { id: 'evt-1', ...validBody };
      prismaMock.event.create.mockResolvedValue(mockCreated as any);

      const res = await POST(createRequest(validBody));
      expect(res.status).toBe(200);
      
      expect(prismaMock.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          semesterId: "sem-1"
        })
      });
    });
  });
});
