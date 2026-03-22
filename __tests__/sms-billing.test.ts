import { sendSMS } from '../lib/sms';
import { prismaMock } from './setup';

// Mock the global fetch API to simulate Hubtel Responses without network calls
global.fetch = jest.fn();

describe('SMS Billing Engine & Provider Integrations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SMS_CLIENT_ID = 'test-client';
    process.env.SMS_SECRET = 'test-secret';
    process.env.SMS_SENDER_ID = 'URF_TEST';
  });

  it('should successfully parse and persist the monetary cost (.Rate) from Hubtel', async () => {
    // 1. Setup the Simulated Hubtel Success Response containing a Rate breakdown
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: '0000',
        MessageId: 'hubtel-123456',
        Rate: 0.035, // Simulate a Ghc 0.035 cost per message
      }),
    });

    // 2. Mock Prisma strictly returning the new SMS Log
    prismaMock.smsLog.create.mockResolvedValue({
      id: 'log-123',
      recipientId: 'member-123',
      phoneNumber: '0241234567',
      message: 'Hello World',
      status: 'SENT',
      providerId: 'hubtel-123456',
      errorMessage: null,
      batchId: 'batch-999',
      cost: 0.035,
      semesterId: 'semester-fall2025',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Execute the internal SMS library logic natively
    const payload = {
      recipientId: 'member-123',
      phoneNumber: '0241234567',
      message: 'Hello World',
      batchId: 'batch-999',
      semesterId: 'semester-fall2025' // Attached for academic boundary filtering
    };

    const response = await sendSMS(payload);

    // 4. Assert the Provider response successfully captured the rate internally
    expect(response.success).toBe(true);
    expect(response.providerId).toBe('hubtel-123456');
    expect(response.rate).toBe(0.035);

    // 5. Assert the structural integrity of the Prisma Query validating the cost propagation
    expect(prismaMock.smsLog.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.smsLog.create).toHaveBeenCalledWith({
      data: {
        recipientId: 'member-123',
        phoneNumber: '0241234567',
        message: 'Hello World',
        batchId: 'batch-999',
        semesterId: 'semester-fall2025',
        cost: 0.035, // Ensures the Database layer captures the Float for the UI summation!
        status: 'SENT',
        providerId: 'hubtel-123456',
        errorMessage: undefined,
      },
    });
  });

  it('should handle Hubtel failure responses without crashing and securely flag failure', async () => {
    // Simulate an insufficient funds / provider error natively
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true, // Hubtel often returns 200 OK even on logical failures
      json: async () => ({
        status: '102',
        Message: 'Insufficient Balance',
      }),
    });

    prismaMock.smsLog.create.mockResolvedValue({
      id: 'log-124',
      recipientId: 'member-123',
      phoneNumber: '0241234567',
      message: 'Test Message',
      status: 'FAILED',
      providerId: null,
      errorMessage: 'Insufficient Balance',
      batchId: 'batch-999',
      cost: null, // Cost is safely null on failure
      semesterId: 'semester-fall2025',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await sendSMS({
      recipientId: 'member-123',
      phoneNumber: '0241234567',
      message: 'Test Message',
      batchId: 'batch-999',
      semesterId: 'semester-fall2025'
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe('Insufficient Balance');

    expect(prismaMock.smsLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cost: undefined, // undefined because JS optional property maps securely
        status: 'FAILED',
        errorMessage: 'Insufficient Balance'
      })
    });
  });
});
