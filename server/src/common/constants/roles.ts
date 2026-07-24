export enum Role {
  SUPER_ADMIN = 'super_admin',
  PLATFORM_OWNER = 'platform_owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SALES = 'sales',
  ACCOUNTANT = 'accountant',
  CASHIER = 'cashier',
  VIEWER = 'viewer',
}

export const ALL_ROLES = Object.values(Role);

export const PLATFORM_ROLES = [Role.SUPER_ADMIN, Role.PLATFORM_OWNER, Role.ADMIN];

/** Roles allowed to write (create/update) business documents */
export const WRITE_ROLES = [Role.SUPER_ADMIN, Role.PLATFORM_OWNER, Role.ADMIN, Role.MANAGER, Role.SALES, Role.ACCOUNTANT, Role.CASHIER];
/** Roles allowed to delete / cancel */
export const DELETE_ROLES = [Role.SUPER_ADMIN, Role.PLATFORM_OWNER, Role.ADMIN, Role.MANAGER];
/** Roles allowed to manage settings & users */
export const SETTINGS_ROLES = [Role.SUPER_ADMIN, Role.PLATFORM_OWNER, Role.ADMIN];
