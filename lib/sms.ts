import { prisma } from "@/lib/prisma"
import { SmsStatus } from "@prisma/client"

export interface SmsPayload {
  recipientId?: string // Optional if sending to a non-member number
  phoneNumber: string
  message: string
}

export interface SmsProviderResponse {
  success: boolean
  providerId?: string
  error?: string
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
        status: response.success ? SmsStatus.SENT : SmsStatus.FAILED,
        providerId: response.providerId,
        errorMessage: response.error
      }
    })

    return response

  } catch (error) {
    console.error("Critical failure during SMS Dispatch:", error)
    
    // Fallback log
    await prisma.smsLog.create({
      data: {
        recipientId: payload.recipientId,
        phoneNumber: payload.phoneNumber,
        message: payload.message,
        status: SmsStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "Unknown critical error"
      }
    })

    return { success: false, error: "Critical dispatch failure" }
  }
}

/**
 * Replace this mock function with the actual API Call to your Ghanaian SMS provider.
 */
async function dispatchToProvider(phone: string, message: string): Promise<SmsProviderResponse> {
  // --- EXAMPLE HUBTEL IMPLEMENTATION ---
  // const apiUrl = "https://smsc.hubtel.com/v1/messages/send"
  // const res = await fetch(`${apiUrl}?clientsecret=${process.env.SMS_SECRET}&clientid=${process.env.SMS_CLIENT_ID}&from=URF&to=${phone}&content=${encodeURIComponent(message)}`)
  // const data = await res.json()
  // if (data.status === 'success') return { success: true, providerId: data.messageId }
  // return { success: false, error: data.message }

  console.log(`[MOCK SMS] Sending to ${phone}: ${message}`)
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Simulate 95% success rate
  if (Math.random() > 0.05) {
    return { 
      success: true, 
      providerId: `mock-id-${Math.random().toString(36).substring(7)}` 
    }
  } else {
    return { 
      success: false, 
      error: "Simulated Provider Timeout" 
    }
  }
}
