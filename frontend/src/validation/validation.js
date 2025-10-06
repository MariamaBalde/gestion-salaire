import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Veuillez entrer une adresse email valide'),
  motDePasse: z.string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

export const registerSchema = z.object({
  nom: z.string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string()
    .min(1, 'L\'email est requis')
    .email('Veuillez entrer une adresse email valide'),
  motDePasse: z.string()
    .min(1, 'Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  nomEntreprise: z.string()
    .min(1, 'Le nom de l\'entreprise est requis')
    .min(2, 'Le nom de l\'entreprise doit contenir au moins 2 caractères'),
  adresseEntreprise: z.string()
    .min(1, 'L\'adresse de l\'entreprise est requise')
    .min(5, 'L\'adresse doit être plus détaillée'),
});