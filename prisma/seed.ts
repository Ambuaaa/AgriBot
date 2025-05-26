import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@agribot.com' },
      update: {},
      create: {
        email: 'admin@agribot.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        preferences: {
          create: {
            language: 'en',
            voiceEnabled: false,
            weatherAlerts: true,
            priceAlerts: true,
            cropReminders: true,
            preferredCrops: ['wheat', 'rice', 'cotton'],
            preferredMarkets: ['Delhi', 'Mumbai', 'Kolkata']
          }
        }
      }
    });

    // Create some market prices
    await prisma.marketPrice.createMany({
      skipDuplicates: true,
      data: [
        {
          crop: 'Wheat',
          variety: 'Regular',
          market: 'Delhi',
          state: 'Delhi',
          district: 'New Delhi',
          price: 2000.50,
          unit: 'quintal',
          date: new Date(),
        },
        {
          crop: 'Rice',
          variety: 'Basmati',
          market: 'Punjab',
          state: 'Punjab',
          district: 'Amritsar',
          price: 3500.75,
          unit: 'quintal',
          date: new Date(),
        }
      ]
    });

    // Create some weather alerts
    await prisma.weatherAlert.createMany({
      skipDuplicates: true,
      data: [
        {
          location: 'Delhi',
          alertType: 'rain',
          severity: 'medium',
          message: 'Moderate rainfall expected in the next 24 hours',
          startTime: new Date(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        {
          location: 'Mumbai',
          alertType: 'temperature',
          severity: 'high',
          message: 'High temperature alert: Expected to reach 38°C',
          startTime: new Date(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }
      ]
    });

    console.log('Seed data created successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 

  