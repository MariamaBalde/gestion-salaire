import { z } from 'zod';
export const registerSchema = z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    email: z.string().email('Email invalide'),
    motDePasse: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    role: z.string().refine(val => ['SUPER_ADMIN', 'ADMIN', 'CAISSIER', 'EMPLOYE'].includes(val), 'Rôle invalide'),
    entrepriseId: z.number().optional(),
});
export const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    motDePasse: z.string().min(1, 'Le mot de passe est requis'),
});
export const entrepriseSchema = z.object({
    nom: z.string().min(1, 'Le nom est requis'),
    adresse: z.string().min(1, 'L\'adresse est requise'),
    devise: z.enum(['XOF', 'EUR', 'USD']).default('XOF'),
    typePeriode: z.enum(['MENSUELLE', 'HEBDOMADAIRE', 'JOURNALIERE']).default('MENSUELLE'),
});
//# sourceMappingURL=validation.js.map