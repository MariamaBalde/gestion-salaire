import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  const hashedPassword = await bcrypt.hash('mariama18', 10);
  const user = await prisma.utilisateur.upsert({
    where: { email: 'mariama@gmail.com' },
    update: {},
    create: {
      nom: 'Mariama Balde',
      email: 'mariama@gmail.com',
      motDePasse: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ User created:', user.email);
  await prisma.$disconnect();
}

createUser();