import AIService, { normalizeBaseUrl } from '../services/AIService';

describe('normalizeBaseUrl', () => {
  test('returns empty string for falsy input', () => {
    expect(normalizeBaseUrl(null)).toBe('');
    expect(normalizeBaseUrl('')).toBe('');
  });

  test('adds https when protocol missing and preferHttp=false', () => {
    expect(normalizeBaseUrl('example.com:8000')).toBe('https://example.com:8000');
    expect(normalizeBaseUrl('example.com')).toBe('https://example.com');
  });

  test('adds http when preferHttp=true', () => {
    expect(normalizeBaseUrl('example.com:8000', true)).toBe('http://example.com:8000');
  });

  test('removes trailing slash', () => {
    expect(normalizeBaseUrl('https://example.com/')).toBe('https://example.com');
  });
});

describe('AIService.setBaseURL', () => {
  test('overrides baseURL and returns normalized value', () => {
    const original = AIService.baseURL;
    const overridden = AIService.setBaseURL('test.local:1234');
    expect(overridden).toBe('http://test.local:1234');
    expect(AIService.baseURL).toBe('http://test.local:1234');
    // restore
    AIService.setBaseURL(original || '');
  });
});
