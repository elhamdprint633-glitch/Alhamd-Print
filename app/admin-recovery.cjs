'use strict';
// Recovery credentials are independent of any user PIN. Only a salted scrypt verifier is retained.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PARAMS={N:32768,r:8,p:1,maxmem:96*1024*1024};
const clean=v=>String(v??'').toUpperCase().replace(/[\s-]/g,'');
class AdminRecovery{
 constructor(dataDir){this.file=path.join(dataDir,'admin-recovery.json');}
 configured(){return fs.existsSync(this.file);}
 issue(adminPinVerifier,adminId){
  if(typeof adminPinVerifier!=='string'||!adminPinVerifier||!adminId)throw Error('مطلوب حساب مدير فعّال لإصدار مفتاح طوارئ');
  const secret=crypto.randomBytes(24).toString('hex').toUpperCase();
  const salt=crypto.randomBytes(16),digest=crypto.scryptSync(secret,salt,32,PARAMS);
  const payload=JSON.stringify({version:1,salt:salt.toString('base64'),hash:digest.toString('base64'),adminId:String(adminId),adminBinding:crypto.createHash('sha256').update(adminPinVerifier).digest('hex'),createdAt:new Date().toISOString()});
  const temp=this.file+'.'+process.pid+'.tmp',fd=fs.openSync(temp,'wx',0o600);
  try{fs.writeFileSync(fd,payload,'utf8');fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  fs.renameSync(temp,this.file);
  return secret.match(/.{1,8}/g).join('-');
 }
 targetUserId(){try{return JSON.parse(fs.readFileSync(this.file,'utf8')).adminId||null;}catch{return null;}}
 matchesVerifier650(pin,id){try{const d=JSON.parse(fs.readFileSync(this.file,'utf8'));return !!pin&&String(id)===String(d.adminId)&&d.adminBinding===crypto.createHash('sha256').update(pin).digest('hex');}catch{return false;}}
 verify(code,adminPinVerifier,adminId){
  if(!this.configured())return false;
  try{
   const data=JSON.parse(fs.readFileSync(this.file,'utf8'));
   const value=clean(code);if(!/^[0-9A-F]{48}$/.test(value))return false;
   if(typeof adminPinVerifier!=='string'||!adminPinVerifier||String(adminId)!==String(data.adminId)||data.adminBinding!==crypto.createHash('sha256').update(adminPinVerifier).digest('hex'))return false;
   const salt=Buffer.from(data.salt,'base64'),expected=Buffer.from(data.hash,'base64');
   if(salt.length!==16||expected.length!==32)return false;
   const actual=crypto.scryptSync(value,salt,32,PARAMS);
   return crypto.timingSafeEqual(actual,expected);
  }catch{return false;}
 }
}
module.exports={AdminRecovery};
