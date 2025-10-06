import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create super admin
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

  // Create first entreprise
  const entreprise1 = await prisma.entreprise.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nom: 'Entreprise Demo 1',
      adresse: '123 Rue Demo 1',
      devise: 'XOF',
      typePeriode: 'MENSUELLE',
      createdById: superAdmin.id,
    },
  });

  // Create second entreprise
  const entreprise2 = await prisma.entreprise.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nom: 'Entreprise Demo 2',
      adresse: '456 Rue Demo 2',
      devise: 'EUR',
      typePeriode: 'MENSUELLE',
      createdById: superAdmin.id,
    },
  });

  // Create admin for entreprise 1
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      nom: 'Admin Demo',
      email: 'admin@demo.com',
      motDePasse: hashedPassword,
      role: 'ADMIN',
      entrepriseId: entreprise1.id,
    },
  });

  // Create cashier for entreprise 1
  const cashierPassword = await bcrypt.hash('caissier123', 10);
  const cashier = await prisma.utilisateur.upsert({
    where: { email: 'caissier@demo.com' },
    update: {},
    create: {
      nom: 'Caissier Demo',
      email: 'caissier@demo.com',
      motDePasse: cashierPassword,
      role: 'CAISSIER',
      entrepriseId: entreprise1.id,
    },
  });

  // Create employees for entreprise 1
  await prisma.employe.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nomComplet: 'John Doe',
      poste: 'Développeur',
      typeContrat: 'FIXE',
      tauxSalaire: 3000.00,
      actif: true,
      entrepriseId: entreprise1.id,
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
      entrepriseId: entreprise1.id,
    },
  });

  // Create employees for entreprise 2
  await prisma.employe.upsert({
    where: { id: 3 },
    update: {},
    create: {
      nomComplet: 'Alice Johnson',
      poste: 'Manager',
      typeContrat: 'FIXE',
      tauxSalaire: 4000.00,
      actif: true,
      entrepriseId: entreprise2.id,
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });