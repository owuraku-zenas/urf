import { POST as SemesterPOST } from '../../app/api/semesters/route';
import { POST as SMSPOST } from '../../app/api/sms/send/route';
import { auth } from '../../auth';
import { dbMock } from '../setup';
import { NextResponse } from 'next/server';

// 1. Rig the authorization module structurally inside Jest
jest.mock('../../auth', () => ({
  auth: jest.fn(),
}));

describe('Role-Based Access Control (RBAC) Isolation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Semesters Architecture Locks', () => {
    it('aggressively drops unauthenticated endpoints entirely', async () => {
      // 1. Simulate absolutely no session natively
      (auth as jest.Mock).mockResolvedValueOnce(null);

      const request = new Request('http://localhost/api/semesters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Hacked Semester',
          academicYear: '2024/2025',
          startDate: '2025-01-01',
          endDate: '2025-06-01',
          status: 'ACTIVE'
        })
      });

      const response = await SemesterPOST(request);
      
      // 2. Assert rigid explicit ejections natively
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
      expect(dbMock.semester.create).not.toHaveBeenCalled();
    });

    it('successfully catches standard non-ADMIN roles actively trying to mutate structures', async () => {
      // 1. Give the attacker a valid session but as a base USER role
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { role: 'USER', email: 'generic@church.com' }
      });

      const request = new Request('http://localhost/api/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Hacked Semester' })
      });

      const response = await SemesterPOST(request);
      
      // 2. Assert rigid bounce logic
      expect(response.status).toBe(401);
      expect(dbMock.semester.create).not.toHaveBeenCalled();
    });
    
    it('seamlessly passes authorized ADMIN sessions into the codebase', async () => {
      // 1. Standard Admin Payload
      (auth as jest.Mock).mockResolvedValueOnce({
        user: { role: 'ADMIN', email: 'admin@urf.com' }
      });
      
      dbMock.semester.findFirst.mockResolvedValueOnce(null);
      dbMock.semester.create.mockResolvedValueOnce({
        id: 'secure-sem', name: 'Spring', academicYear: '2024', startDate: new Date().toISOString(), endDate: new Date().toISOString(), status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      } as any);

      const request = new Request('http://localhost/api/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Spring',
          academicYear: '2024',
          startDate: '2025-01-01',
          endDate: '2025-06-01',
          status: 'ACTIVE'
        })
      });

      const response = await SemesterPOST(request);
      // Valid mapping
      expect(response.status).toBe(200);
      expect(dbMock.semester.create).toHaveBeenCalledTimes(1);
    });
  });

});
