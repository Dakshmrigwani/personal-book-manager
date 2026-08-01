import { comparePassword, hashPassword } from '@/utils/password-hash';
import { describe, it, expect } from 'vitest';

describe('Password hashing utilities', () => {
  it('hashes a password', async () => {
    const password = 'StrongPassword123!';

    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20);
  });

  it('returns true when comparing correct password and hash', async () => {
    const password = 'StrongPassword123!';
    const hash = await hashPassword(password);

    const result = await comparePassword(password, hash);

    expect(result).toBe(true);
  });

  it('returns false when comparing incorrect password', async () => {
    const password = 'StrongPassword123!';
    const hash = await hashPassword(password);

    const result = await comparePassword('WrongPassword', hash);

    expect(result).toBe(false);
  });

  it('generates different hashes for the same password', async () => {
    const password = 'StrongPassword123!';

    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });
});
