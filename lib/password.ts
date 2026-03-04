import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hashed] = stored.split(':');
  if (!salt || !hashed) return false;

  const derived = scryptSync(password, salt, 64);
  const target = Buffer.from(hashed, 'hex');

  if (derived.length !== target.length) return false;
  return timingSafeEqual(derived, target);
}
