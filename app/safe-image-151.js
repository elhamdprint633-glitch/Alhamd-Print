/* Strict image data-URL validation for persisted and imported image fields. */
(function (root) {
    'use strict';
    const IMAGE_DATA_URL = /^data:image\/(?:png|jpeg|webp|gif|bmp|avif|svg\+xml|x-icon|vnd\.microsoft\.icon);base64,[A-Za-z0-9+/]+={0,2}$/i;
    function isSafe(value, maxLength) {
        const limit = Number.isFinite(maxLength) && maxLength > 0 ? maxLength : 30 * 1024 * 1024;
        if (value === undefined || value === null || value === '') return true;
        return typeof value === 'string' && value.length <= limit && IMAGE_DATA_URL.test(value);
    }
    function safe(value, maxLength) { return isSafe(value, maxLength) && typeof value === 'string' ? value : ''; }
    const api = Object.freeze({ isSafe, safe });
    root.AlhamdSafeImage151 = api;
    if (typeof module === 'object' && module && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
