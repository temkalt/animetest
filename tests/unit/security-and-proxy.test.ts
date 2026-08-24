import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isUrlSafeAndAllowed } from '../../src/lib/security/proxy-security';

describe('Proxy & SSRF Security Validator', () => {
  test('should allow legitimate whitelisted CDN video streams', () => {
    const validUrls = [
      'https://cache.libria.fun/videos/media/ts/1080/1.ts',
      'https://anilibria.top/api/v1/anime/releases/1',
      'https://kodikplayer.com/find-player?shikimoriID=154587',
      'https://theatre.stravers.live/manifest.m3u8',
      'https://cdn.myanimelist.net/images/anime/10/1000.jpg',
      'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1.jpg',
    ];

    for (const url of validUrls) {
      const res = isUrlSafeAndAllowed(url);
      assert.equal(res.safe, true, `Expected ${url} to be allowed`);
    }
  });

  test('should block private, loopback, and local network IPs (SSRF)', () => {
    const dangerousUrls = [
      'https://127.0.0.1/admin',
      'https://localhost:5432',
      'https://169.254.169.254/latest/meta-data/',
      'https://10.0.0.1/secret',
      'https://192.168.1.1/router',
      'https://172.16.0.1/internal',
      'https://0.0.0.0/',
      'https://[::1]/',
      'https://metadata.google.internal/computeMetadata/v1/',
    ];

    for (const url of dangerousUrls) {
      const res = isUrlSafeAndAllowed(url);
      assert.equal(res.safe, false, `Expected ${url} to be blocked`);
    }
  });

  test('should block non-https protocols', () => {
    const nonHttpsUrls = [
      'http://cache.libria.fun/stream.m3u8',
      'ftp://cache.libria.fun/file',
      'file:///etc/passwd',
      'gopher://cache.libria.fun/',
      'javascript:alert(1)',
      'data:text/html,<h1>test</h1>',
    ];

    for (const url of nonHttpsUrls) {
      const res = isUrlSafeAndAllowed(url);
      assert.equal(res.safe, false, `Expected ${url} to be blocked`);
    }
  });

  test('should block unauthorized and spoofed domains', () => {
    const unauthorized = [
      'https://evil-attacker.com/malware.m3u8',
      'https://cache.libria.fun.attacker.com/stream.m3u8',
      'https://kodikplayer.com.phishing.io/video',
      'https://google.com/search',
    ];

    for (const url of unauthorized) {
      const res = isUrlSafeAndAllowed(url);
      assert.equal(res.safe, false, `Expected ${url} to be blocked`);
    }
  });

  test('should block URLs with embedded userinfo credentials or non-standard ports', () => {
    assert.equal(isUrlSafeAndAllowed('https://admin:password@cache.libria.fun/stream.m3u8').safe, false);
    assert.equal(isUrlSafeAndAllowed('https://cache.libria.fun:8080/stream.m3u8').safe, false);
  });
});
