import { z } from 'zod';

export const registerSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.string().refine(val => ['SUPER_ADMIN', 'ADMIN', 'CAISSIER', 'EMPLOYE'].includes(val), 'Rôle invalide').optional(),
  entrepriseId: z.number().optional(),
  nomEntreprise: z.string().optional(),
  adresseEntreprise: z.string().optional(),
});


export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  motDePasse: z.string().min(1, 'Le mot de passe est requis'),
});

export const entrepriseSchema = z.object({
  nom: z.string().min(1, 'Le nom est requis'),
  adresse: z.string().min(1, 'L\'adresse est requise'),
  devise: z.string().optional(),
  typePeriode: z.enum(['MENSUELLE', 'HEBDOMADAIRE', 'JOURNALIERE']).optional(),
  logo: z.string().nullable().optional()
});

export const payRunSchema = z.object({
  entrepriseId: z.number().int().positive('Entreprise ID requis'),
  type: z.enum(['MENSUELLE', 'HEBDOMADAIRE', 'JOURNALIERE'], 'Type de période invalide'),
  dateDebut: z.string().refine(val => !isNaN(Date.parse(val)), 'Date de début invalide'),
  dateFin: z.string().refine(val => !isNaN(Date.parse(val)), 'Date de fin invalide'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EntrepriseInput = z.infer<typeof entrepriseSchema>;
export type PayRunInput = z.infer<typeof payRunSchema>;