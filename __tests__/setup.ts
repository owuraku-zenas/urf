import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { prisma } from '../lib/prisma';
import { db } from '../lib/db';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

jest.mock('../lib/db', () => ({
  __esModule: true,
  db: mockDeep<PrismaClient>(),
}));

// Provide typed access to the mocked Prisma clients
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
export const dbMock = db as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  mockReset(dbMock);
});
