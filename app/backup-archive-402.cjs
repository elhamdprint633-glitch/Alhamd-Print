'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {pipeline}=require('node:stream/promises');
const {Transform}=require('node:stream');
const Zip=require('./assets/vendor/jszip/jszip.min.js');
const MAX=512*1024*1024,MAX_FILES=10000;
function safeName(name){
 if(typeof name!=='string'||name.includes('\\')||name.startsWith('/')||name.includes('\0')||name.split('/').some(p=>p==='..'||p==='.'||p.includes(':')))throw Error('مسار غير آمن داخل النسخة الاحتياطية');
 if(!/^(state\.alhbak|verification\.alhbak|README\.txt|attachments\/[^/]+\.alhbak|UserAssets\/.+\.alhbak)$/.test(name))throw Error('ملف غير متوقع داخل النسخة الاحتياطية: '+name);
 return name;
}
async function write(folder,target){
 const zip=new Zip();let total=0,count=0;
 function visit(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  if(item.isSymbolicLink())throw Error('النسخة لا تقبل روابط ملفات');
  const file=path.join(dir,item.name);
  if(item.isDirectory())visit(file);else if(item.isFile()){
   const name=safeName(path.relative(folder,file).split(path.sep).join('/'));
   total+=fs.statSync(file).size;if(total>MAX||++count>MAX_FILES)throw Error('حجم النسخة أكبر من الحد المدعوم (512 ميبيبايت)');
   zip.file(name,fs.createReadStream(file));
  }
 }}visit(folder);
 if(!zip.file('state.alhbak'))throw Error('بيانات النسخة غير موجودة');
 const temp=target+'.'+crypto.randomUUID()+'.tmp';
 try{
  await pipeline(zip.generateNodeStream({streamFiles:true,compression:'DEFLATE',compressionOptions:{level:3}}),fs.createWriteStream(temp,{flags:'wx',mode:0o600}));
  const fd=fs.openSync(temp,'r+');try{fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  fs.renameSync(temp,target);
 }catch(error){fs.rmSync(temp,{force:true});throw error;}
 return {bytes:fs.statSync(target).size};
}
async function unpack(file,parent){
 if(fs.statSync(file).size>MAX)throw Error('حجم النسخة أكبر من الحد المدعوم (512 ميبيبايت)');
 let zip;
 try{zip=await Zip.loadAsync(fs.readFileSync(file));}catch{throw Error('ملف ZIP غير سليم أو ليس نسخة احتياطية للبرنامج');}
 const entries=Object.values(zip.files).filter(f=>!f.dir);let total=0;
 if(entries.length>MAX_FILES||!zip.file('state.alhbak'))throw Error('ملف ZIP لا يحتوي نسخة احتياطية مدعومة');
 for(const entry of entries){
  safeName(entry.name);
  if(entry.unsafeOriginalName&&entry.unsafeOriginalName!==entry.name)throw Error('مسار غير آمن داخل النسخة الاحتياطية');
  const size=entry._data?.uncompressedSize;
  if(!Number.isSafeInteger(size)||size<0||(total+=size)>MAX)throw Error('النسخة المضغوطة تتجاوز الحد المسموح بعد فك الضغط');
 }
 const dir=fs.mkdtempSync(path.join(parent,'backup-read-'));
 try{
  for(const entry of entries){
   const dest=path.join(dir,entry.name);let actual=0;
   const limit=new Transform({transform(chunk,encoding,done){
    actual+=chunk.length;
    if(actual>entry._data.uncompressedSize)return done(Error('ملف مضغوط يتجاوز الحجم المعلن'));
    done(null,chunk);
   }});
   fs.mkdirSync(path.dirname(dest),{recursive:true});
   await pipeline(entry.nodeStream(),limit,fs.createWriteStream(dest,{flags:'wx',mode:0o600}));
   if(actual!==entry._data.uncompressedSize)throw Error('ملف ناقص داخل النسخة الاحتياطية');
  }
  fs.mkdirSync(path.join(dir,'attachments'),{recursive:true});
  return {dir,stateFile:path.join(dir,'state.alhbak'),dispose:()=>fs.rmSync(dir,{recursive:true,force:true})};
 }catch(error){fs.rmSync(dir,{recursive:true,force:true});throw error;}
}
module.exports={write,unpack,safeName};
