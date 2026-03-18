import { calculateMemberCommitment } from '../lib/commitment';
import { prismaMock } from './setup';

describe('calculateMemberCommitment', () => {
  const memberId = 'member-1';
  const semesterId = 'semester-1';

  it('sets UNCOMMITTED if there are no events', async () => {
    prismaMock.event.count.mockResolvedValue(0);
    prismaMock.semesterCommitment.findUnique.mockResolvedValue(null);

    await calculateMemberCommitment(memberId, semesterId);

    expect(prismaMock.semesterCommitment.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: { status: 'UNCOMMITTED' }
    }));
  });

  it('does not overwrite status if admin override exists when 0 events', async () => {
    prismaMock.event.count.mockResolvedValue(0);
    prismaMock.semesterCommitment.findUnique.mockResolvedValue({
      id: '1', memberId, semesterId, status: 'COMMITTED', overrideReason: 'Admin override', createdAt: new Date(), updatedAt: new Date()
    });

    await calculateMemberCommitment(memberId, semesterId);

    expect(prismaMock.semesterCommitment.upsert).not.toHaveBeenCalled();
  });

  it('calculates COMMITTED correctly (>= 70%)', async () => {
    prismaMock.event.count.mockResolvedValue(10);
    prismaMock.attendance.count.mockResolvedValue(8); // 80%
    prismaMock.semesterCommitment.findUnique.mockResolvedValue(null);

    await calculateMemberCommitment(memberId, semesterId);

    expect(prismaMock.semesterCommitment.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: { status: 'COMMITTED' }
    }));
  });

  it('calculates AT_RISK correctly (>= 40% and < 70%)', async () => {
    prismaMock.event.count.mockResolvedValue(10);
    prismaMock.attendance.count.mockResolvedValue(5); // 50%
    prismaMock.semesterCommitment.findUnique.mockResolvedValue(null);

    await calculateMemberCommitment(memberId, semesterId);

    expect(prismaMock.semesterCommitment.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: { status: 'AT_RISK' }
    }));
  });

  it('calculates UNCOMMITTED correctly (< 40%)', async () => {
    prismaMock.event.count.mockResolvedValue(10);
    prismaMock.attendance.count.mockResolvedValue(2); // 20%
    prismaMock.semesterCommitment.findUnique.mockResolvedValue(null);

    await calculateMemberCommitment(memberId, semesterId);

    expect(prismaMock.semesterCommitment.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: { status: 'UNCOMMITTED' }
    }));
  });
});
