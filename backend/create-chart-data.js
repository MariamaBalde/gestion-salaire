import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createChartData() {
  try {
    console.log('Creating payroll evolution data for charts...');

    // Create payRuns for the last 6 months with different dates
    const months = [
      { month: 4, year: 2024, name: 'Avril 2024' },
      { month: 5, year: 2024, name: 'Mai 2024' },
      { month: 6, year: 2024, name: 'Juin 2024' },
      { month: 7, year: 2024, name: 'Juillet 2024' },
      { month: 8, year: 2024, name: 'Août 2024' },
      { month: 9, year: 2024, name: 'Septembre 2024' },
    ];

    for (let i = 0; i < months.length; i++) {
      const monthData = months[i];
      const startDate = new Date(monthData.year, monthData.month - 1, 1);
      const endDate = new Date(monthData.year, monthData.month - 1, 30);
      const createdDate = new Date(monthData.year, monthData.month - 1, 15); // Mid-month

      // Create PayRun for this month
      const payRun = await prisma.payRun.upsert({
        where: { id: i + 10 }, // Start from ID 10 to avoid conflicts
        update: {},
        create: {
          entrepriseId: 1,
          type: 'MENSUELLE',
          dateDebut: startDate,
          dateFin: endDate,
          status: 'CLOTURE',
          createdAt: createdDate,
          updatedAt: createdDate,
        },
      });

      // Create payslips for this payrun with varying amounts
      const baseAmount1 = 500000 + (i * 50000); // Increasing salary over time
      const baseAmount2 = 400000 + (i * 30000);
      const baseAmount3 = 300000 + (i * 20000);

      await prisma.payslip.upsert({
        where: { id: (i * 3) + 10 },
        update: {},
        create: {
          payRunId: payRun.id,
          employeeId: 1,
          brut: baseAmount1,
          deductions: baseAmount1 * 0.1,
          net: baseAmount1 * 0.9,
          status: 'PAYE',
          createdAt: createdDate,
          updatedAt: createdDate,
        },
      });

      await prisma.payslip.upsert({
        where: { id: (i * 3) + 11 },
        update: {},
        create: {
          payRunId: payRun.id,
          employeeId: 2,
          brut: baseAmount2,
          deductions: baseAmount2 * 0.1,
          net: baseAmount2 * 0.9,
          status: 'PAYE',
          createdAt: createdDate,
          updatedAt: createdDate,
        },
      });

      // Add third employee payslip
      await prisma.payslip.upsert({
        where: { id: (i * 3) + 12 },
        update: {},
        create: {
          payRunId: payRun.id,
          employeeId: 1, // Reuse employee 1 for demo
          brut: baseAmount3,
          deductions: baseAmount3 * 0.1,
          net: baseAmount3 * 0.9,
          status: 'ATTENTE', // Some pending payments
          createdAt: createdDate,
          updatedAt: createdDate,
        },
      });

      console.log(`✅ Created payroll data for ${monthData.name}`);
    }

    // Create some pending payments for upcoming payments section
    const currentMonth = new Date();
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    
    const pendingPayRun = await prisma.payRun.upsert({
      where: { id: 20 },
      update: {},
      create: {
        entrepriseId: 1,
        type: 'MENSUELLE',
        dateDebut: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
        dateFin: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
        status: 'APPROUVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create pending payslips
    await prisma.payslip.upsert({
      where: { id: 100 },
      update: {},
      create: {
        payRunId: pendingPayRun.id,
        employeeId: 1,
        brut: 600000,
        deductions: 60000,
        net: 540000,
        status: 'ATTENTE',
      },
    });

    await prisma.payslip.upsert({
      where: { id: 101 },
      update: {},
      create: {
        payRunId: pendingPayRun.id,
        employeeId: 2,
        brut: 500000,
        deductions: 50000,
        net: 450000,
        status: 'ATTENTE',
      },
    });

    console.log('✅ Chart data created successfully!');
    console.log('✅ Upcoming payments data created!');
    console.log('Now the dashboard will show:');
    console.log('- Payroll evolution chart with 6 months of data');
    console.log('- Upcoming payments list');
    
  } catch (error) {
    console.error('❌ Error creating chart data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createChartData();