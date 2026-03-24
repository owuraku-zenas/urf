;(async () => {
  const { PrismaClient } = require("@prisma/client")
  const { hash } = require("bcryptjs")

  const prisma = new PrismaClient()

  async function main() {
    console.log("Starting production seed... 🌱")

    // 1. Create Admin User
    const adminEmail = "urfzone4@gmail.com"
    const adminPassword = "admin123" // Default password, user should change it after first login
    const hashedPassword = await hash(adminPassword, 12)

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    })
    console.log(`Created/Updated Admin User: ${admin.email}`)

    // 2. Create Cell Groups
    const cellNames = ["Pent", "UPSA", "Diaspora", "Volta Hall", "Main Campus"]
    
    for (const name of cellNames) {
      const cell = await prisma.cellGroup.upsert({
        where: { name },
        update: {},
        create: {
          name,
          description: `${name} Cell Group`,
        },
      })
      console.log(`Created/Updated Cell Group: ${cell.name}`)
    }

    console.log("Production seed completed successfully! ✅")
  }

  try {
    await main()
  } catch (e) {
    console.error("Error during production seed:", e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
})()
