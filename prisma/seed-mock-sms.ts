import { PrismaClient, SmsStatus } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding mock SMS history data...")

  // Fetch some members to attach logs to
  const members = await prisma.member.findMany({ take: 15 })

  // We want specific batch sizes as requested: 1, 3, 4, 5, 10
  const batchSizes = [1, 3, 4, 5, 10]

  // Create 5 separate mock broadcast batches
  for (let i = 0; i < batchSizes.length; i++) {
    const batchId = crypto.randomUUID()
    const batchSize = batchSizes[i]
    const message = `Mock Broadcast ${i + 1}: Important announcement for {{name}}!`

    const payload = Array.from({ length: batchSize }).map((_, idx) => {
      // Use existing members if available, or fallback to mock phone numbers
      const member = members.length > 0 ? members[idx % members.length] : null
      const fakePhone = `024${Math.floor(1000000 + Math.random() * 9000000)}`
      const name = member ? member.name.split(" ")[0] : `User${idx}`

      return {
        recipientId: member?.id || null,
        phoneNumber: member?.phone || fakePhone,
        batchId: batchId,
        message: message.replace("{{name}}", name),
        status: Math.random() > 0.15 ? SmsStatus.SENT : SmsStatus.FAILED, // 85% success simulation
        errorMessage: Math.random() <= 0.15 ? "Simulated network timeout" : null,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Random past date within ~115 days
      }
    })

    await prisma.smsLog.createMany({
      data: payload
    })

    console.log(`Created mock batch ${batchId} with ${batchSize} logs.`)
  }

  console.log("Mock SMS seeding complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
