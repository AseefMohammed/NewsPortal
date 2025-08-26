import assert from 'assert';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const helpersPath = path.join(__dirname, '../services/apiHelpers.js');
  const helpers = await import(pathToFileURL(helpersPath).href);
  const normalize = helpers.normalizeBaseUrl;
  const { DevAIService } = helpers;

  console.log('Running ESM simple tests for AIService helpers...');

  // normalizeBaseUrl tests
  assert.strictEqual(normalize(null), '');
  assert.strictEqual(normalize(''), '');
  assert.strictEqual(normalize('example.com:8000'), 'https://example.com:8000');
  assert.strictEqual(normalize('example.com', true), 'http://example.com');
  assert.strictEqual(normalize('https://example.com/'), 'https://example.com');

  // setBaseURL tests
  const instance = new DevAIService('');
  const overridden = instance.setBaseURL('test.local:1234');
  assert.strictEqual(overridden, 'http://test.local:1234');
  assert.strictEqual(instance.baseURL, 'http://test.local:1234');

  console.log('All ESM simple tests passed.');
  process.exit(0);
} catch (err) {
  console.error('ESM test failed:', err);
  process.exit(2);
}
