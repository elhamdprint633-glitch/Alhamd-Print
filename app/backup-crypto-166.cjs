'use strict';
const crypto=require('node:crypto');
const MAGIC='ALHAMD-SECURE-BACKUP-1',MAX=1024*1024*1024;
const params={N:32768,r:8,p:1,maxmem:96*1024*1024};
function keyFor(mode,secret,salt){
 if(mode==='device'){
  const key=Buffer.isBuffer(secret)?secret:Buffer.from(secret||'');
  if(key.length!==32)throw Error('تعذر العثور على مفتاح حماية الجهاز؛ لا يجوز إنشاء نسخة غير مشفرة بدلاً منها.');
  return key;
 }
 if(mode==='portable'){
  if(typeof secret!=='string'||secret.length<12)throw Error('كلمة مرور النسخة المنقولة يجب أن تتكون من 12 رمزاً على الأقل.');
  return crypto.scryptSync(secret,salt,32,params);
 }
 throw Error('نمط تشفير النسخة غير معروف');
}
function encrypt(data,{mode='device',secret}={}){
 const buffer=Buffer.isBuffer(data)?data:Buffer.from(String(data),'utf8');
 if(buffer.length>MAX)throw Error('حجم النسخة يتجاوز الحد المسموح');
 const salt=crypto.randomBytes(16),iv=crypto.randomBytes(12),key=keyFor(mode,secret,salt);
 const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
 const payload=Buffer.concat([cipher.update(buffer),cipher.final()]);
 return JSON.stringify({magic:MAGIC,mode,salt:salt.toString('base64'),iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:payload.toString('base64')});
}
function decrypt(text,{deviceKey,passphrase}={}){
 const stream=require('./backup-stream-650.cjs');if(stream.isV2(text))return stream.decrypt(text,{deviceKey,passphrase});
 const obj=JSON.parse(Buffer.isBuffer(text)?text.toString('utf8'):String(text));
 if(!obj||obj.magic!==MAGIC||!['portable','device'].includes(obj.mode))throw Error('هذا الملف ليس نسخة احتياطية مشفرة مدعومة.');
 const salt=Buffer.from(obj.salt||'','base64'),iv=Buffer.from(obj.iv||'','base64'),tag=Buffer.from(obj.tag||'','base64'),raw=Buffer.from(obj.data||'','base64');
 if(salt.length!==16||iv.length!==12||tag.length!==16||raw.length>MAX)throw Error('ملف النسخة غير سليم أو أكبر من الحد الأقصى.');
 const key=keyFor(obj.mode,obj.mode==='device'?deviceKey:passphrase,salt);
 try{const d=crypto.createDecipheriv('aes-256-gcm',key,iv);d.setAuthTag(tag);return Buffer.concat([d.update(raw),d.final()]);}
 catch{throw Error(obj.mode==='portable'?'تعذر فتح النسخة: كلمة مرور النسخة غير صحيحة أو الملف تالف.':'هذه نسخة محلية مرتبطة بمفتاح بيانات الجهاز الأصلي. قد يفشل فتحها بعد تصفير البيانات أو تغيير حساب Windows. احتفظ بمجلد البيانات القديم ومفتاحه database-key.dpapi؛ تغيير امتداد الملف لن يفك تشفيره.');}
}
module.exports={MAGIC,encrypt,decrypt};
