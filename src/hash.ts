import crypto from 'crypto';

export function getHashOf(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
