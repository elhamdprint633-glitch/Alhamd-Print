'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const HASH_RE = /^\$scrypt\$16384\$8\$1\$([A-Za-z0-9+/]+=*)\$([A-Za-z0-9+/]+=*)$/;

function toAsciiDigits(val) {
  return String(val ?? '')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .trim();
}

function normalizePin(pin) {
  const value = toAsciiDigits(pin);
  if (!/^\d{4,8}$/.test(value)) throw new Error('الرقم السري يجب أن يتكون من 4 إلى 8 أرقام');
  return value;
}
function pinHash(pin) {
  const value = normalizePin(pin);
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(value, salt, 32, PARAMS);
  return `$scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString('base64')}$${hash.toString('base64')}`;
}
function isPinHash(value) { return typeof value === 'string' && HASH_RE.test(value); }
function migrateLegacyPins(users) {
  let changed = false, hashed = 0, reset = 0;
  for (const user of Array.isArray(users) ? users : []) {
    if (!user || user.pin === null || user.pin === undefined || user.pin === '' || isPinHash(user.pin)) continue;
    const legacy = toAsciiDigits(user.pin);
    if (/^\d{4,8}$/.test(legacy)) {
      user.pin = pinHash(legacy);
      user.pinLength = legacy.length;
      if (user.pinDefault === undefined) user.pinDefault = legacy === '1234';
      user.pinNeedsReset = false;
      hashed++;
    } else {
      user.pin = null;
      user.pinLength = null;
      user.pinNeedsReset = true;
      reset++;
    }
    changed = true;
  }
  return { changed, hashed, reset };
}
function verifyPin(pin, stored) {
  const value = toAsciiDigits(pin);
  if (!/^\d{4,8}$/.test(value) || typeof stored !== 'string') return false;
  const match = HASH_RE.exec(stored);
  if (!match) {
    const cleanStored = toAsciiDigits(stored);
    const a = Buffer.from(value, 'utf8');
    const b = Buffer.from(cleanStored, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  try {
    const salt = Buffer.from(match[1], 'base64');
    const expected = Buffer.from(match[2], 'base64');
    if (salt.length !== 16 || expected.length !== 32) return false;
    const actual = crypto.scryptSync(value, salt, expected.length, PARAMS);
    return crypto.timingSafeEqual(actual, expected);
  } catch { return false; }
}

class PersistentPinLimiter {
  constructor(file, { limit = 5, windowMs = 60_000, baseLockMs = 30_000, maxLockMs = 15 * 60_000 } = {}) {
    this.file = file;
    this.limit = limit;
    this.windowMs = windowMs;
    this.baseLockMs = baseLockMs;
    this.maxLockMs = maxLockMs;
    this.state = {};
    this.load();
  }
  load() {
    try {
      const parsed = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) this.state = parsed;
    } catch { this.state = {}; }
  }
  save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const temp = `${this.file}.${process.pid}.${Date.now()}.tmp`;
    const fd = fs.openSync(temp, 'w', 0o600);
    try { fs.writeFileSync(fd, JSON.stringify(this.state), 'utf8'); fs.fsyncSync(fd); }
    finally { fs.closeSync(fd); }
    fs.renameSync(temp, this.file);
  }
  status(id) {
    const row = this.state[String(id)] || {};
    const remaining = Math.max(0, Number(row.lockedUntil || 0) - Date.now());
    return { locked: remaining > 0, lockedMs: remaining, failures: Number(row.failures) || 0 };
  }
  fail(id) {
    const key = String(id);
    const now = Date.now();
    const row = this.state[key] || { failures: 0, windowStart: now, level: 0 };
    if (now - Number(row.windowStart || 0) > this.windowMs) { row.failures = 0; row.windowStart = now; }
    row.failures = (Number(row.failures) || 0) + 1;
    if (row.failures >= this.limit) {
      row.level = Math.min(9, (Number(row.level) || 0) + 1);
      const duration = Math.min(this.maxLockMs, this.baseLockMs * (2 ** (row.level - 1)));
      row.lockedUntil = now + duration;
      row.failures = 0;
      row.windowStart = now;
    }
    this.state[key] = row;
    this.save();
    return this.status(key);
  }
  success(id) {
    delete this.state[String(id)];
    this.save();
  }
}

module.exports = { pinHash, verifyPin, isPinHash, migrateLegacyPins, normalizePin, PersistentPinLimiter };
