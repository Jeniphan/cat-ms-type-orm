import { randomBytes } from 'crypto';

export function GenerateRandomBase64(length: number): string {
  // Generate a buffer of random bytes
  const buffer = randomBytes(length);
  // Convert the buffer to a base64 string
  return buffer.toString('base64');
}
