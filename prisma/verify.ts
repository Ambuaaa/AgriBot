import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
  try {
    // Check admin user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@agribot.com' },
      include: { preferences: true }
    });
    console.log('\n=== User Data ===');
    console.log(user ? 'Admin user exists ✅' : 'Admin user missing ❌');
    if (user) {
      console.log('User details:', {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified
      });
    }

    // Check market prices
    const marketPrices = await prisma.marketPrice.findMany();
    console.log('\n=== Market Prices ===');
    console.log(`Found ${marketPrices.length} market prices`);
    marketPrices.forEach(price => {
      console.log(`- ${price.crop} in ${price.market}: ₹${price.price}/${price.unit}`);
    });

    // Check weather alerts
    const weatherAlerts = await prisma.weatherAlert.findMany();
    console.log('\n=== Weather Alerts ===');
    console.log(`Found ${weatherAlerts.length} weather alerts`);
    weatherAlerts.forEach(alert => {
      console.log(`- ${alert.location}: ${alert.alertType} (${alert.severity})`);
      console.log(`  Message: ${alert.message}`);
    });

  } catch (error) {
    console.error('Error verifying data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData(); 