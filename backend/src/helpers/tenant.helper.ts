import { Request } from "express";

export interface TenantContext {
  schoolId: string;
  userId: string;
  role: string;
}

/**
 * Extracts and asserts the active tenant (schoolId) from authenticated request.
 */
export const getTenantContext = (req: Request): TenantContext => {
  const schoolId = req.tenant?.schoolId || req.user?.schoolId;
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!schoolId) {
    throw new Error("Tenant context missing: schoolId not found on request.");
  }

  if (!userId || !role) {
    throw new Error("Auth context missing: user not authenticated.");
  }

  return { schoolId, userId, role };
};

/**
 * Returns a where clause filter scoped to the tenant school.
 */
export const scopeToTenant = <T extends Record<string, any>>(
  schoolId: string,
  extraFilters?: T
): T & { schoolId: string } => {
  return {
    ...extraFilters,
    schoolId,
  } as T & { schoolId: string };
};
