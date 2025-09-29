import type { NextFunction, Request, Response } from "express";
export declare function RoleMiddleware(roles: string[]): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=RoleMiddleware.d.ts.map