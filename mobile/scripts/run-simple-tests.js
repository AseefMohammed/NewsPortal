const assert = require('assert');
const path = require('path');

(async () => {
  try {
    const aiService = require(path.resolve(__dirname, '../services/AIService.js'));
    // If the module exports default as an object + named exports, handle both
    const normalize = aiService.normalizeBaseUrl || aiService.default?.normalizeBaseUrl;
    const aiDefault = aiService.default || aiService;

    console.log('Running simple tests for AIService helpers...');

    // normalizeBaseUrl tests
    assert.strictEqual(normalize(null), '');
    assert.strictEqual(normalize(''), '');
    assert.strictEqual(normalize('example.com:8000'), 'https://example.com:8000');
    assert.strictEqual(normalize('example.com', true), 'http://example.com');
    assert.strictEqual(normalize('https://example.com/'), 'https://example.com');

    // setBaseURL tests
    const original = aiDefault.baseURL;
    const overridden = aiDefault.setBaseURL('test.local:1234');
    assert.strictEqual(overridden, 'http://test.local:1234');
    assert.strictEqual(aiDefault.baseURL, 'http://test.local:1234');
    // restore
    aiDefault.setBaseURL(original || '');

    console.log('All simple tests passed.');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(2);
  }
})();
