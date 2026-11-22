'use strict';
const crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
function der(tag,...parts){const body=Buffer.concat(parts.map(p=>Buffer.from(p)));let len;if(body.length<128)len=Buffer.from([body.length]);else{let hex=body.length.toString(16);if(hex.length%2)hex='0'+hex;const bytes=Buffer.from(hex,'hex');len=Buffer.concat([Buffer.from([128+bytes.length]),bytes]);}return Buffer.concat([Buffer.from([tag]),len,body]);}
const seq=(...p)=>der(0x30,...p),set=(...p)=>der(0x31,...p),integer=b=>{let bytes=Buffer.isBuffer(b)?Buffer.from(b):Buffer.from([b]);while(bytes.length>1&&bytes[0]===0)bytes=bytes.subarray(1);if(!bytes.length)bytes=Buffer.from([0]);if(bytes[0]&128)bytes=Buffer.concat([Buffer.from([0]),bytes]);return der(2,bytes);};
function oid(value){const parts=value.split('.').map(Number),bytes=[parts[0]*40+parts[1]];for(const n of parts.slice(2)){const p=[n&127];let rest=Math.floor(n/128);while(rest){p.unshift((rest&127)|128);rest=Math.floor(rest/128);}bytes.push(...p);}return der(6,Buffer.from(bytes));}
function certificate(options={}){
 let serial=options.serial;if(serial!==undefined&&(!Buffer.isBuffer(serial)||serial.length<1||serial.length>20||!serial.some(x=>x!==0)))throw Error('رقم شهادة غير صالح');if(serial===undefined){do{serial=crypto.randomBytes(16);}while(!serial.some(x=>x!==0));}
 const pair=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
 const algorithm=seq(oid('1.2.840.113549.1.1.11'),der(5));
 const name=seq(set(seq(oid('2.5.4.3'),der(12,Buffer.from('Alhamd Print Direct Mobile','utf8')))));
 const now=new Date(),until=new Date(now);now.setUTCDate(now.getUTCDate()-1);until.setUTCFullYear(until.getUTCFullYear()+10);
 const time=d=>der(24,Buffer.from(d.toISOString().replace(/[-:T]/g,'').replace(/\.\d{3}Z$/,'Z')));
 const pub=pair.publicKey.export({format:'der',type:'spki'});
 const extensions=der(0xa3,seq(
  seq(oid('2.5.29.19'),der(1,Buffer.from([255])),der(4,seq())),
  seq(oid('2.5.29.17'),der(4,seq(der(0x82,Buffer.from('alhamd-print.local')))))
 ));
 const body=seq(der(0xa0,integer(2)),integer(serial),algorithm,name,seq(time(now),time(until)),name,pub,extensions);
 const signature=crypto.sign('sha256',body,pair.privateKey);
 const bytes=seq(body,algorithm,der(3,Buffer.concat([Buffer.from([0]),signature])));
 const cert='-----BEGIN CERTIFICATE-----\n'+bytes.toString('base64').match(/.{1,64}/g).join('\n')+'\n-----END CERTIFICATE-----\n';
 const key=pair.privateKey.export({format:'pem',type:'pkcs8'});new crypto.X509Certificate(cert);
 return {cert,key,fingerprint:crypto.createHash('sha256').update(bytes).digest('hex').toUpperCase()};
}
function identity(dataDir,safeStorage){if(!safeStorage?.isEncryptionAvailable())throw Error('حماية مفاتيح الاتصال غير متاحة على هذا الجهاز. الربط المحلي متاح.');const file=path.join(dataDir,'direct-mobile-identity412.json');if(fs.existsSync(file)){const stored=JSON.parse(fs.readFileSync(file,'utf8')),key=safeStorage.decryptString(Buffer.from(stored.protectedKey,'base64')),x509=new crypto.X509Certificate(stored.cert);if(new Date(x509.validTo)<=new Date())throw Error('انتهت صلاحية شهادة الربط المباشر؛ تواصل مع الدعم لتجديدها وإعادة اعتماد الهاتف.');return {cert:stored.cert,key,fingerprint:x509.fingerprint256.replace(/:/g,'').toUpperCase()};}const value=certificate(),stored={version:1,cert:value.cert,protectedKey:safeStorage.encryptString(value.key).toString('base64')};fs.mkdirSync(dataDir,{recursive:true});const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(stored),{mode:0o600});fs.renameSync(tmp,file);return value;}
module.exports={certificate,identity,encodeUnsignedInteger651:integer};
