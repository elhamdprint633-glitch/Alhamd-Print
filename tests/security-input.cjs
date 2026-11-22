const test = require('node:test');
const assert = require('node:assert/strict');
const safeImage = require('../app/safe-image-151.js');

test('accepts only bounded base64 image data URLs', () => {
    for (const mime of ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']) {
        assert.equal(safeImage.isSafe(`data:${mime};base64,AAAA`), true, mime);
    }
    assert.equal(safeImage.isSafe(''), true);
    assert.equal(safeImage.isSafe(undefined), true);
    assert.equal(safeImage.isSafe('https://example.com/logo.png'), false);
    assert.equal(safeImage.isSafe('javascript:alert(1)'), false);
    assert.equal(safeImage.isSafe('data:text/html;base64,PHNjcmlwdD4='), false);
    assert.equal(safeImage.isSafe('data:image/png;base64,AAAA" onerror="alert(1)'), false);
    assert.equal(safeImage.isSafe('data:image/png;base64,AAAA', 8), false);
});

test('safe() clears malformed or non-image values', () => {
    assert.equal(safeImage.safe('data:image/png;base64,AAAA'), 'data:image/png;base64,AAAA');
    assert.equal(safeImage.safe('data:text/html;base64,AAAA'), '');
    assert.equal(safeImage.safe(123), '');
});
