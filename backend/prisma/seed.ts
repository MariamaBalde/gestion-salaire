import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default super admin
  const superAdminPassword = await bcrypt.hash('superadmin123', 10);
  const superAdmin = await prisma.utilisateur.upsert({
    where: { email: 'superadmin@gessalaire.com' },
    update: {},
    create: {
      nom: 'Super Admin',
      email: 'superadmin@gessalaire.com',
      motDePasse: superAdminPassword,
      role: 'SUPER_ADMIN',
    },
  });

  // Create entreprise
  const entreprise = await prisma.entreprise.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nom: 'Entreprise Demo',
      adresse: '123 Rue Demo',
      devise: 'XOF',
      typePeriode: 'MENSUELLE',
      createdById: superAdmin.id,
    },
  });

  // Create admin user for the entreprise
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      nom: 'Admin Demo',
      email: 'admin@demo.com',
      motDePasse: hashedPassword,
      role: 'ADMIN',
      entrepriseId: entreprise.id,
    },
  });

  // Create some employees
  await prisma.employe.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nomComplet: 'John Doe',
      poste: 'Développeur',
      typeContrat: 'FIXE',
      tauxSalaire: 3000.00,
      actif: true,
      entrepriseId: entreprise.id,
    },
  });

  await prisma.employe.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nomComplet: 'Jane Smith',
      poste: 'Designer',
      typeContrat: 'FIXE',
      tauxSalaire: 2500.00,
      actif: true,
      entrepriseId: entreprise.id,
    },
  });

  console.log('Seed data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });