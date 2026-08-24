import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from '../../src/lib/auth/password';

describe('Password & Session Token Security', () => {
  test('should hash and verify passwords correctly using PBKDF2 salt:hash', async () => {
    const password = 'StrongPassword2026!';
    const hash = await hashPassword(password);

    assert.ok(hash.includes(':'), 'Hash format should be salt:derivedKey');
    const [salt, key] = hash.split(':');
    assert.ok(salt.length >= 32, 'Salt should have high entropy');
    assert.ok(key.length >= 64, 'Derived key should have proper length');

    // Verification
    const isValid = await verifyPassword(password, hash);
    assert.equal(isValid, true, 'Valid password must verify');

    const isInvalid = await verifyPassword('WrongPassword123', hash);
    assert.equal(isInvalid, false, 'Wrong password must be rejected');
  });

  test('should generate and verify tamper-proof HMAC session tokens', () => {
    const payload = {
      id: 'usr_test_123',
      email: 'test@kuronami.io',
      username: 'otaku_tester',
    };

    const token = createSessionToken(payload);
    assert.ok(token.split('.').length === 3, 'Token must have 3 JWT segments (header.payload.signature)');

    const verified = verifySessionToken(token);
    assert.ok(verified !== null, 'Valid token must be verified');
    assert.equal(verified?.id, payload.id);
    assert.equal(verified?.email, payload.email);
    assert.equal(verified?.username, payload.username);

    // Tampering test: modify 1 character in payload
    const parts = token.split('.');
    const tamperedPayload = Buffer.from(JSON.stringify({ ...payload, id: 'usr_admin' })).toString('base64url');
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    const tamperedResult = verifySessionToken(tamperedToken);
    assert.equal(tamperedResult, null, 'Tampered token must fail signature verification');
  });
});
