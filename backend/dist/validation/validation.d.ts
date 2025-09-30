import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    nom: z.ZodString;
    email: z.ZodString;
    motDePasse: z.ZodString;
    role: z.ZodString;
    entrepriseId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const registerSuperAdminSchema: z.ZodObject<{
    nom: z.ZodString;
    email: z.ZodString;
    motDePasse: z.ZodString;
    nomEntreprise: z.ZodString;
    adresseEntreprise: z.ZodString;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    motDePasse: z.ZodString;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
//# sourceMappingURL=validation.d.ts.map