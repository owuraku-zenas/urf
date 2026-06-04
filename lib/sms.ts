import { prisma } from "@/lib/prisma"
import { SmsStatus } from "@prisma/client"

export interface SmsPayload {
  recipientId?: string // Optional if sending to a non-member number
  phoneNumber: string
  message: string
  batchId?: string
  semesterId?: string
}

export interface SmsProviderResponse {
  success: boolean
  providerId?: string
  error?: string
  rate?: number
}

/**
 * Generic Utility to Send SMS. 
 * Swap out the fetch logic inside `dispatchToProvider` for Hubtel, MNotify, or Arksekel.
 */
export async function sendSMS(payload: SmsPayload): Promise<SmsProviderResponse> {
  try {
    // 1. Dispatch the SMS via HTTP Request to your chosen Provider
    const response = await dispatchToProvider(payload.phoneNumber, payload.message)
    
    // 2. Log the outcome to the database
    await prisma.smsLog.create({
      data: {
        recipientId: payload.recipientId,
        phoneNumber: payload.phoneNumber,
        message: payload.message,
        batchId: payload.batchId,
        semesterId: payload.semesterId,
        cost: response.rate,
        status: response.success ? SmsStatus.SENT : SmsStatus.FAILED,
        providerId: response.providerId,
        errorMessage: response.error
      }
    })

    return response

  } catch (error) {
    console.error("Critical failure during SMS Dispatch:", error)
    
    // Fallback log
    try {
      await prisma.smsLog.create({
        data: {
          recipientId: payload.recipientId,
          phoneNumber: payload.phoneNumber,
          message: payload.message,
          batchId: payload.batchId,
          semesterId: payload.semesterId,
          status: SmsStatus.FAILED,
          errorMessage: error instanceof Error ? error.message : "Unknown critical error"
        }
      })
    } catch (fallbackError) {
      console.error("CRITICAL: Fallback logger also crashed. Usually means Prisma Client needs a restart.", fallbackError)
    }

    return { success: false, error: "Critical dispatch failure" }
  }
}

/**
 * Dispatch function using Hubtel SMS API
 */
async function dispatchToProvider(phone: string, message: string): Promise<SmsProviderResponse> {
  const clientId = process.env.SMS_CLIENT_ID;
  const clientSecret = process.env.SMS_SECRET;
  const senderId = process.env.SMS_SENDER_ID || "URF";

  if (!clientId || !clientSecret) {
    console.error("SMS Provider credentials are not configured in .env");
    return { success: false, error: "SMS Provider credentials missing" };
  }

  const apiUrl = "https://smsc.hubtel.com/v1/messages/send";
  // Hubtel expects no leading + (233XXXXXXXXX not +233XXXXXXXXX)
  const formattedPhone = phone.startsWith('+') ? phone.slice(1) : phone;
  const url = `${apiUrl}?clientsecret=${encodeURIComponent(clientSecret)}&clientid=${encodeURIComponent(clientId)}&from=${encodeURIComponent(senderId)}&to=${encodeURIComponent(formattedPhone)}&content=${encodeURIComponent(message)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    // Hubtel often returns status field or MessageId on success
    if (res.ok && (data.status === '0000' || data.status === '0' || data.status === 0 || data.status === 'success' || data.MessageId || data.messageId)) {
      return { 
        success: true, 
        providerId: data.MessageId || data.messageId || `hubtel-${Date.now()}`,
        rate: data.Rate || data.rate ? Number(data.Rate || data.rate) : undefined
      };
    }
    
    return { 
      success: false, 
      error: data.message || data.Message || "Failed to send SMS" 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Network error" 
    };
  }
}
