const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Store } = require('../app/store.cjs');
const { pinHash, verifyPin, isPinHash, migrateLegacyPins, PersistentPinLimiter } = require('../app/security-152.cjs');

const basicState = (pin='1234') => ({ users:[{id:'u_admin',username:'المدير',name:'المدير',role:'admin',pin}], orders:[], items:[], clients:[], suppliers:[], treasury:[], shopSettings:{name:'بيانات تجريبية خاصة'} });

test('PIN hashing uses salted scrypt and verifies legacy and hashed PINs', () => {
  const hashed = pinHash('482615');
  assert.equal(isPinHash(hashed), true);
  assert.equal(verifyPin('482615', hashed), true);
  assert.equal(verifyPin('482616', hashed), false);
  assert.equal(verifyPin('1234', '1234'), true);
  assert.notEqual(pinHash('482615'), pinHash('482615'));
  assert.throws(() => pinHash('12ab'), /4 إلى 8/);
});

test('first successful login migration hashes every legacy user PIN and flags invalid values for reset', () => {
  const users=[
    {id:'admin',pin:'1234'},
    {id:'cashier',pin:482615},
    {id:'storekeeper',pin:'bad-pin'},
    {id:'already',pin:pinHash('8251')},
    {id:'empty',pin:null}
  ];
  const result=migrateLegacyPins(users);
  assert.deepEqual(result,{changed:true,hashed:2,reset:1});
  assert.equal(verifyPin('1234',users[0].pin),true);
  assert.equal(users[0].pinDefault,true);
  assert.equal(verifyPin('482615',users[1].pin),true);
  assert.equal(users[2].pin,null);
  assert.equal(users[2].pinNeedsReset,true);
  assert.equal(isPinHash(users[3].pin),true);
  assert.equal(users[4].pin,null);
});

test('PIN rate limit persists across process restarts and progressively increases lock duration', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'alhamd-pin-limit-'));
  try {
    const file = path.join(dir, 'attempts.json');
    let limiter = new PersistentPinLimiter(file, { limit: 2, baseLockMs: 30_000, maxLockMs: 120_000 });
    assert.equal(limiter.fail('u1').locked, false);
    const locked = limiter.fail('u1');
    assert.equal(locked.locked, true);
    assert.ok(locked.lockedMs > 0);
    limiter = new PersistentPinLimiter(file, { limit: 2, baseLockMs: 30_000, maxLockMs: 120_000 });
    assert.equal(limiter.status('u1').locked, true);
    limiter.state.u1.lockedUntil = Date.now() - 1;
    limiter.save();
    limiter.fail('u1');
    const second = limiter.fail('u1');
    assert.ok(second.lockedMs > 30_000);
    limiter.success('u1');
    assert.equal(limiter.status('u1').locked, false);
  } finally { fs.rmSync(dir, { recursive:true, force:true }); }
});

test('SQLite encrypts records and settings at rest and rejects a wrong key', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'alhamd-encrypted-db-'));
  const file = path.join(dir, 'data.sqlite');
  const key = Buffer.alloc(32, 7);
  try {
    const state = basicState();
    state.clients.push({id:'c1',name:'SECRET_CLIENT_MARKER_12984'});
    const db = new Store(file, { encryptionKey:key });
    db.save(JSON.stringify(state), 0);
    assert.deepEqual(JSON.parse(db.load()), state);
    db.close();
    const raw = fs.readFileSync(file);
    assert.equal(raw.includes(Buffer.from('SECRET_CLIENT_MARKER_12984')), false);
    const reopened = new Store(file, { encryptionKey:key });
    assert.deepEqual(JSON.parse(reopened.load()), state);
    reopened.close();
    assert.throws(() => new Store(file, { encryptionKey:Buffer.alloc(32, 8) }), /تعذر فك تشفير قاعدة البيانات/);
  } finally { try { fs.rmSync(dir, { recursive:true, force:true }); } catch {} }
});

test('existing plaintext SQLite database is migrated to encrypted records without data loss', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'alhamd-db-migrate-'));
  const file = path.join(dir, 'data.sqlite');
  const key = Buffer.alloc(32, 9);
  try {
    const state = basicState('1234');
    state.orders.push({id:'o1',notes:'LEGACY_SECRET_MARKER_8472',total:120});
    let db = new Store(file);
    db.save(JSON.stringify(state), 0);
    db.close();
    db = new Store(file, { encryptionKey:key });
    assert.deepEqual(JSON.parse(db.load()), state);
    db.close();
    assert.equal(fs.readFileSync(file).includes(Buffer.from('LEGACY_SECRET_MARKER_8472')), false);
    db = new Store(file, { encryptionKey:key });
    assert.deepEqual(JSON.parse(db.load()), state);
    db.close();
  } finally { fs.rmSync(dir, { recursive:true, force:true }); }
});
