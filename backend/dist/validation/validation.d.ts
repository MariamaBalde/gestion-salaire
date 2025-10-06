import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    nom: z.ZodString;
    email: z.ZodString;
    motDePasse: z.ZodString;
    role: z.ZodString;
    entrepriseId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    motDePasse: z.ZodString;
}, z.core.$strip>;
export declare const entrepriseSchema: z.ZodObject<{
    nom: z.ZodString;
    adresse: z.ZodString;
    devise: z.ZodDefault<z.ZodString>;
    typePeriode: z.ZodDefault<z.ZodEnum<{
        MENSUELLE: "MENSUELLE";
        HEBDOMADAIRE: "HEBDOMADAIRE";
        JOURNALIERE: "JOURNALIERE";
    }>>;
}, z.core.$strip>;
export declare const payRunSchema: z.ZodObject<{
    entrepriseId: z.ZodNumber;
    type: z.ZodEnum<{
        MENSUELLE: "MENSUELLE";
        HEBDOMADAIRE: "HEBDOMADAIRE";
        JOURNALIERE: "JOURNALIERE";
    }>;
    dateDebut: z.ZodString;
    dateFin: z.ZodString;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EntrepriseInput = z.infer<typeof entrepriseSchema>;
export type PayRunInput = z.infer<typeof payRunSchema>;
//# sourceMappingURL=validation.d.ts.map