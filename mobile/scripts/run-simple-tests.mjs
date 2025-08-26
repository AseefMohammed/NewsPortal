import assert from 'assert';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const aiModulePath = path.join(__dirname, '../services/AIService.js');
  const aiModule = await import(pathToFileURL(aiModulePath).href);
  const normalize = aiModule.normalizeBaseUrl;
  const AIService = aiModule.default;

  console.log('Running ESM simple tests for AIService helpers...');

  // normalizeBaseUrl tests
  assert.strictEqual(normalize(null), '');
  assert.strictEqual(normalize(''), '');
  assert.strictEqual(normalize('example.com:8000'), 'https://example.com:8000');
  assert.strictEqual(normalize('example.com', true), 'http://example.com');
  assert.strictEqual(normalize('https://example.com/'), 'https://example.com');

  // setBaseURL tests
  const original = AIService.baseURL;
  const overridden = AIService.setBaseURL('test.local:1234');
  assert.strictEqual(overridden, 'http://test.local:1234');
  assert.strictEqual(AIService.baseURL, 'http://test.local:1234');
  // restore
  AIService.setBaseURL(original || '');

  console.log('All ESM simple tests passed.');
  process.exit(0);
} catch (err) {
  console.error('ESM test failed:', err);
  process.exit(2);
}
