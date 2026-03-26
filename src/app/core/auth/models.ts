export interface BffMeResponse {
  iss?: string;
  name?: string;
  email?: string;
  userId?: string;
  username?: string;
  authenticated?: boolean;
  expiresAt: string | null;

  groups?: string[];
  authorities?: string[];
}
