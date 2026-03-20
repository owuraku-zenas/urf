import { PrismaClient } from "@prisma/client"
import crypto from "crypto"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding mock SMS history data...")

  // Fetch some members to attach logs to
  const members = await prisma.member.findMany({ take: 15 })

  if (members.length === 0) {
    console.log("No members found. Add members first before seeding SMS logs.")
    return
  }

  // Create 3 separate mock broadcast batches
  for (let i = 0; i < 3; i++) {
    const batchId = crypto.randomUUID()
    const message = `Mock Broadcast ${i + 1}: Important announcement for {{name}}!`
    const batchSize = Math.floor(Math.random() * 10) + 5 // Between 5 to 15 recipients

    const payload = members.slice(0, batchSize).map(m => ({
      recipientId: m.id,
      phoneNumber: m.phone,
      batchId: batchId,
      message: message.replace("{{name}}", m.name.split(" ")[0]),
      status: Math.random() > 0.15 ? "SENT" : "FAILED", // 85% success simulation
      errorMessage: Math.random() <= 0.15 ? "Simulated network timeout" : null,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Random past date within ~115 days
    }))

    // @ts-ignore
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
