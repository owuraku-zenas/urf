import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting database seeding...')
    
    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10)
    console.log('Password hashed successfully')
    
    const admin = await prisma.user.upsert({
      where: { email: "urfzone4@gmail.com" },
      update: {
        password: hashedPassword,
        role: "ADMIN",
      },
      create: {
        email: "urfzone4@gmail.com",
        name: "Admin",
        password: hashedPassword,
        role: "ADMIN",
      },
    })

    console.log('Admin user created/updated successfully:', admin)
  } catch (error) {
    console.error('Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('Database connection closed')
  }) 