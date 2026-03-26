export const PERMISSIONS = {
  SUPPORT: 'SUPPORT',

  USERS: {
    VIEW: 'USERS_CONSULT',
    CREATE: 'USERS_CREATE',
    UPDATE: 'USERS_UPDATE',
    DELETE: 'USERS_DELETE',
    CHANGE: 'USERS_CHANGE',
  },

  GROUPS: {
    VIEW: 'GROUPS_CONSULT',
    CREATE: 'GROUPS_CREATE',
    UPDATE: 'GROUPS_UPDATE',
    DELETE: 'GROUPS_DELETE',
    CHANGE: 'GROUPS_CHANGE',
    MANAGE_PERMISSIONS: 'GROUP_MANAGEMENT_PERMISSION',
    MANAGE_USERS: 'GROUP_MANAGEMENT_USER',
  },
  AUDIT: {
    VIEW: 'AUDIT_MAIL_CONSULT',
  },
} as const;

type ValueOf<T> = T[keyof T];
type DeepValueOf<T> = T extends object ? DeepValueOf<ValueOf<T>> : T;

export type Permission = DeepValueOf<typeof PERMISSIONS>;

export const ALL_PERMISSIONS: Permission[] = [
  PERMISSIONS.SUPPORT,
  ...Object.values(PERMISSIONS.USERS),
  ...Object.values(PERMISSIONS.GROUPS),
];
