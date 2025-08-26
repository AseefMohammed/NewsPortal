// Lightweight helpers extracted for node-safe testing
export function normalizeBaseUrl(rawUrl, preferHttp = false) {
  if (!rawUrl) return '';
  let url = String(rawUrl).trim();

  if (!/^https?:\/\//i.test(url)) {
    url = (preferHttp ? 'http://' : 'https://') + url;
  }

  if (url.endsWith('/')) url = url.slice(0, -1);
  return url;
}

export class DevAIService {
  constructor(base = '') {
    this.baseURL = normalizeBaseUrl(base, true);
  }
  setBaseURL(rawUrl) {
    const normalized = normalizeBaseUrl(rawUrl, true);
    this.baseURL = normalized;
    return this.baseURL;
  }
}
