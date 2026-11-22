'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
let DatabaseSync;
try { ({ DatabaseSync } = require('node:sqlite')); }
catch { throw Error('يتطلب البرنامج محرك SQLite الأصلي. لم تُفتح قاعدة البيانات ولم يتم تعديل ملفاتها.'); }
const LEGACY_PREFIX = 'ALHDB1:', ENCRYPTED_PREFIX = 'ALHDB2:';
const aad=(kind,id)=>JSON.stringify(['alhamd650',kind,String(id??'')]);

class Store {
  constructor(file, options = {}) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    this.file=file;
    this.key = options.encryptionKey ? Buffer.from(options.encryptionKey) : null;
    if (this.key && this.key.length !== 32) throw Error('مفتاح تشفير قاعدة البيانات غير صالح');
    this.db = new DatabaseSync(file);
    this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000; PRAGMA auto_vacuum=INCREMENTAL; PRAGMA secure_delete=ON; CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS records (collection TEXT NOT NULL,id TEXT NOT NULL,pos INTEGER NOT NULL,payload TEXT NOT NULL,PRIMARY KEY(collection,id)); CREATE INDEX IF NOT EXISTS record_order ON records(collection,pos);');
    const status = this.db.prepare('PRAGMA quick_check').get();
    if (Object.values(status)[0] !== 'ok') throw Error('فشل فحص قاعدة البيانات');
    this.cache = new Map();
    this.revision = Number(this.db.prepare("SELECT value FROM meta WHERE key='revision'").get()?.value) || 0;
    if (this.key) this.migrateEncryption();
    this.initAudit650();
    require('./mobile-store-660.cjs').init(this);
    this.load();
  }
  encode(text, context = 'external') {
    if (!this.key) return String(text);
    const iv=crypto.randomBytes(12), cipher=crypto.createCipheriv('aes-256-gcm',this.key,iv);
    cipher.setAAD(Buffer.from(context));
    const bytes=Buffer.concat([cipher.update(String(text),'utf8'),cipher.final()]);
    return ENCRYPTED_PREFIX+iv.toString('hex')+':'+cipher.getAuthTag().toString('hex')+':'+bytes.toString('base64');
  }
  decode(text, context = 'external', legacy = false) {
    const value=String(text),v2=value.startsWith(ENCRYPTED_PREFIX),v1=value.startsWith(LEGACY_PREFIX);
    if(!v1&&!v2){if(this.key&&this.strict650)throw Error('رفض سجل غير مشفر بعد ترقية حماية البيانات');return value;}
    if(!this.key)throw Error('قاعدة البيانات مشفرة؛ يلزم مفتاح الجهاز الأصلي');
    if(v1&&this.strict650&&!legacy)throw Error('رفض خفض إصدار حماية البيانات');
    try {const parts=value.slice((v2?ENCRYPTED_PREFIX:LEGACY_PREFIX).length).split(':');
      if(parts.length!==3)throw Error('envelope');const iv=Buffer.from(parts[0],'hex'),tag=Buffer.from(parts[1],'hex');
      if(iv.length!==12||tag.length!==16)throw Error('envelope');
      const d=crypto.createDecipheriv('aes-256-gcm',this.key,iv);if(v2)d.setAAD(Buffer.from(context));d.setAuthTag(tag);
      return Buffer.concat([d.update(Buffer.from(parts[2],'base64')),d.final()]).toString('utf8');
    }catch{throw Error('تعذر فك تشفير قاعدة البيانات وتوثيق هوية السجل: المفتاح أو هوية السجل أو البيانات غير سليمة');}
  }
  migrateEncryption() {
    const marker=this.db.prepare("SELECT value FROM meta WHERE key='cipher650'").get();
    const anchor=this.file+'.cipher650',seal=crypto.createHmac('sha256',this.key).update('alhamd650-cipher-format').digest('hex');
    if(fs.existsSync(anchor)&&(!marker||fs.readFileSync(anchor,'utf8')!==seal))throw Error('تعذر فك تشفير قاعدة البيانات: علامة الحماية أو المفتاح غير مطابق؛ لم يُسمح بخفض إصدار التشفير');
    const ensureAnchor=()=>{if(!fs.existsSync(anchor)){const tmp=anchor+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(tmp,seal,{flag:'wx',mode:0o600});fs.renameSync(tmp,anchor);}};
    const records=this.db.prepare('SELECT collection,id,payload FROM records').all();
    const settings=this.db.prepare("SELECT value FROM meta WHERE key='settings'").get();
    if(marker){this.strict650=true;if(this.decode(marker.value,aad('meta','cipher650'))!=='2')throw Error('إصدار الحماية غير صالح');ensureAnchor();return;}
    if(records.some(r=>String(r.payload).startsWith(ENCRYPTED_PREFIX))||String(settings?.value).startsWith(ENCRYPTED_PREFIX))throw Error('علامة ترقية حماية البيانات مفقودة؛ احتفظ بالملفات واسترجع نسخة سليمة');
    // Check every old envelope before beginning the atomic migration.
    const plain=records.map(r=>({...r,text:this.decode(r.payload,aad(r.collection,r.id),true)}));
    const metaText=settings?this.decode(settings.value,aad('meta','settings'),true):null;
    if(records.length||settings){this.db.exec('PRAGMA wal_checkpoint(FULL)');const file=this.file;if(file&&file!==':memory:'&&!fs.existsSync(file+'.before650.sqlite.enc'))require('./backup-stream-650.cjs').encryptFile(file,file+'.before650.sqlite.enc',{secret:this.key});}
    this.db.exec('BEGIN IMMEDIATE');
    try{const up=this.db.prepare('UPDATE records SET payload=? WHERE collection=? AND id=?');
      for(const r of plain)up.run(this.encode(r.text,aad(r.collection,r.id)),r.collection,r.id);
      if(settings)this.db.prepare("UPDATE meta SET value=? WHERE key='settings'").run(this.encode(metaText,aad('meta','settings')));
      this.db.prepare('INSERT INTO meta(key,value) VALUES(?,?)').run('cipher650',this.encode('2',aad('meta','cipher650')));
      this.db.exec('COMMIT');this.strict650=true;ensureAnchor();
    }catch(e){try{this.db.exec('ROLLBACK');}catch{}throw e;}
    this.db.exec('PRAGMA wal_checkpoint(TRUNCATE); VACUUM; PRAGMA wal_checkpoint(TRUNCATE)');
  }
  initAudit650(){require('./audit-650.cjs').init(this,aad);}
  audit650(options={}){return require('./audit-650.cjs').page(this,aad,options);}
  backupState650(){const s=JSON.parse(this.load(false)||'null');if(!s)return null;const all650=require('./audit-650.cjs').all(this,aad);if(all650.length)s.auditTrail166=all650;return JSON.stringify(s);}
  readRecord(collection,id) {const row=this.db.prepare('SELECT payload FROM records WHERE collection=? AND id=?').get(String(collection),String(id));return row?JSON.parse(this.decode(row.payload,aad(String(collection),String(id)))):null;}
  load(refreshCache = true) {
    const row = this.db.prepare("SELECT value FROM meta WHERE key='settings'").get();
    if (!row) return null;
    if(refreshCache)this.revision = Number(this.db.prepare("SELECT value FROM meta WHERE key='revision'").get()?.value) || 0;
    const s = JSON.parse(this.decode(row.value,aad('meta','settings')));
    if(refreshCache)this.cache.clear();
    for (const r of this.db.prepare('SELECT * FROM records ORDER BY collection,pos').all()) {
      const payload = this.decode(r.payload,aad(r.collection,r.id));
      (s[r.collection] || (s[r.collection] = [])).push(JSON.parse(payload));
      if(refreshCache)this.cache.set(r.collection + '\0' + r.id, { payload, pos: r.pos });
    }
    const names = JSON.parse(this.db.prepare("SELECT value FROM meta WHERE key='collections'").get()?.value || '[]');
    for (const n of names) if (!s[n]) s[n] = [];
    const journal650=this.audit650({limit:200,ascending:true});if(journal650.total)s.auditTrail166=journal650.rows;
    return JSON.stringify(s);
  }
  save(text, expectedRevision = null, options = {}) {
    if (typeof text !== 'string' || Buffer.byteLength(text) > 300 * 1024 * 1024) throw Error('حجم البيانات غير مدعوم');
    const state = JSON.parse(text);
    if (!state || typeof state !== 'object' || !Array.isArray(state.users) || !Array.isArray(state.orders)) throw Error('بيانات غير صالحة');
    const finance=require('./financial-integrity-166.cjs');
    const previous640=options.priorState??this.load(false);
    if(!options.restore&&previous640){const prior=JSON.parse(previous640),oldIds=new Set((prior.orders||[]).map(o=>o.id));for(const o of state.orders)if(!oldIds.has(o.id)&&o.draftId640&&state.orders.some(v=>v.id!==o.id&&v.draftId640===o.draftId640))throw Error('هذه المسودة سبق حفظها في فاتورة أخرى. افتح الفاتورة المحفوظة للتعديل بدل تكرارها');}
    const audit650=require('./audit-650.cjs'), incomingAudit650=options.restore?state.auditTrail166||[]:[];
    const events650=options.auditDeletion&&previous640?audit650.events(JSON.parse(previous640),options.auditActor660?{...state,currentUser:options.auditActor660}:state):[];
    delete state.auditTrail166;
    if(!options.restore&&previous640){const prior640=JSON.parse(previous640),kept640=new Set((state.orders||[]).map(o=>o.id)),removed640=new Set((prior640.orders||[]).filter(o=>!kept640.has(o.id)).map(o=>o.id));if((state.adjustments||[]).some(a=>a.orderId&&removed640.has(a.orderId)))throw Error('لا يمكن حذف فاتورة لها تسوية مرتبطة؛ راجع سند التسوية أو سجّل مرتجعًا رسميًا');}
    require('./corrections-650.js').assertTransition(options.restore?state:JSON.parse(previous640||'{}'),state);
    require('./workspace-650.js').allocations(state);
    require('./quick-access-651.js').validatePreferences(state);
    finance.validate(state);
    const returns640=require('./sales-returns-640.js');returns640.validate(state);
    if(!options.restore&&previous640)returns640.assertTransition(JSON.parse(previous640),state);
    require('./party-ledger-411.js').validate(state);
    require('./external-services-407.js').validate(state);
    require('./treasury-discounts-408.js').validate(state);
    require('./operations-149-model.js').validateOperations(state);
    if (!options.restore) {
      for (const o of state.orders) {
        const cached = this.cache.get('orders\0' + o.id);
        if (!cached) continue;
        const old = JSON.parse(cached.payload);
        for (const key of ['ops149', 'costSnapshot149', 'paymentParts149', 'attachments149']) if (old[key] !== undefined && o[key] === undefined) throw Error('هذا الجهاز لا يدعم تفاصيل الفاتورة الحديثة. حدّث التطبيق أو عدّل الفاتورة من الكمبيوتر.');
        if (old.lines?.some(l => l.spec149 && Object.keys(l.spec149).length) && !o.lines?.some(l => Object.prototype.hasOwnProperty.call(l, 'spec149'))) throw Error('التعديل سيفقد مواصفات الطباعة. استخدم الكمبيوتر لتعديل هذه الفاتورة.');
      }
    }
    const metadata = {}, arrays = [], current = new Map(), operations = [];
    for (const [k, v] of Object.entries(state)) {
      if (!Array.isArray(v)) { metadata[k] = v; continue; }
      arrays.push(k);
      for (let i = 0; i < v.length; i++) {
        const payload = JSON.stringify(v[i]), id = String(v[i]?.id ?? ('@' + i)), key = k + '\0' + id;
        if (current.has(key)) throw Error('رقم مكرر: ' + k + ' / ' + id);
        const rec = { payload, pos: i };
        current.set(key, rec);
        const old = this.cache.get(key);
        if (!old || old.payload !== payload || old.pos !== i) operations.push([k, id, i, payload]);
      }
    }
    const up = this.db.prepare('INSERT INTO records(collection,id,pos,payload) VALUES(?,?,?,?) ON CONFLICT(collection,id) DO UPDATE SET pos=excluded.pos,payload=excluded.payload');
    const del = this.db.prepare('DELETE FROM records WHERE collection=? AND id=?');
    const meta = this.db.prepare('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const actual = Number(this.db.prepare("SELECT value FROM meta WHERE key='revision'").get()?.value) || 0;
      if (actual !== this.revision || expectedRevision !== null && Number(expectedRevision) !== actual) {
        const e = Error('تغيرت البيانات من جهاز آخر. حدّث البيانات ثم أعد تسجيل العملية.');
        e.code = 'SYNC_CONFLICT'; e.revision = actual;
        this.db.exec('ROLLBACK'); throw e;
      }
      for (const [key] of this.cache) if (!current.has(key)) { const cut = key.indexOf('\0'); del.run(key.slice(0, cut), key.slice(cut + 1)); }
      for (const row of operations) up.run(row[0], row[1], row[2], this.encode(row[3],aad(row[0],row[1])));
      meta.run('settings', this.encode(JSON.stringify(metadata),aad('meta','settings')));
      meta.run('collections', JSON.stringify(arrays));
      audit650.insert(this,aad,[...incomingAudit650,...events650]);
      const next = actual + 1;
      meta.run('revision', String(next));
      require('./mobile-store-660.cjs').commit(this,options,events650,next);
      this.db.exec('COMMIT');
      this.cache = current; this.revision = next;
      return next;
    } catch (e) { try { this.db.exec('ROLLBACK'); } catch {} throw e; }
  }
  loadSnapshot() { return { state: this.load(), revision: this.revision }; }
  compact() { this.db.exec('PRAGMA wal_checkpoint(TRUNCATE); PRAGMA incremental_vacuum(2000);'); }
  close() { this.db.close(); }
}
module.exports = { Store, ENCRYPTED_PREFIX };
