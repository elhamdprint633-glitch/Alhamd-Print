'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
/** One authorization gate for desktop IPC and authenticated phone sessions. */
function validate(prior,state,user,{dataDir,remote=false,allowUsers700=false}={}){
 if(!user)throw Error('انتهت صلاحية الحساب الحالي');
 require('./renderer-state-650.cjs').mergePins(prior,state);require('./permissions-650.js').migrate(state);
 // The renderer fills old accounts' display-only PIN metadata during normalization.
 // Retain the original account record when the stored verifier itself did not change.
 for(const u of state.users||[]){const old=(prior.users||[]).find(v=>v.id===u.id);if(old&&old.pin===u.pin){if(old.pinLength===undefined&&u.pinLength===4)delete u.pinLength;if(old.pinDefault===undefined&&u.pinDefault===false)delete u.pinDefault;}}

 if(String(state.currentUser)!==String(user.id))throw Error('لا يجوز تبديل المستخدم بدون PIN');
 if(remote){for(const key of (allowUsers700?['autoBackupConfig']:['users','autoBackupConfig']))if(JSON.stringify(prior[key])!==JSON.stringify(state[key]))throw Error('إدارة المستخدمين والنسخ الاحتياطي تتم من الكمبيوتر');}
 if(JSON.stringify(prior.users||[])!==JSON.stringify(state.users||[])&&user.role!=='admin')throw Error('تعديل المستخدمين يتطلب صلاحية المدير');
 require('./server-permissions-166.cjs').assertChanges(prior,state,user);require('./workspace-650.js').assertPrefs(prior,state,user);require('./workflow-650.js').assertTransition(prior,state,user);
 const old=new Set((prior.proofApprovals650||[]).map(x=>x.id));
 for(const p of (state.proofApprovals650||[]).filter(p=>!old.has(p.id)&&p.action==='approve')){const a=p.attachment;if(!/^[a-f0-9-]{36}\.[a-z0-9]{1,8}$/.test(a?.file||''))throw Error('ملف اعتماد غير صالح');const raw=fs.readFileSync(path.join(dataDir,'OrderAttachments',a.file));if(raw.length!==a.size||crypto.createHash('sha256').update(raw).digest('hex')!==a.sha256)throw Error('ملف إثبات الاعتماد غير مطابق');}
 return true;
}
module.exports={validate};
