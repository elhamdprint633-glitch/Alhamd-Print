'use strict';
const P=require('./pairing-model-701.js');
function prepare(info,direct,payload){if(!payload||typeof payload!=='object'||Array.isArray(payload)||Object.keys(payload).some(k=>!['mode','kind'].includes(k))||!['local','tailscale'].includes(payload.mode)||!['bundle','fingerprint'].includes(payload.kind))throw Error('طلب نسخ بيانات الربط غير صالح');const pair=P.build(info,direct,payload.mode),text=payload.kind==='fingerprint'?pair.fingerprint:'ALHAMD7:'+Buffer.from(JSON.stringify(pair),'utf8').toString('base64url');return {ok:true,text,pair};}
module.exports={prepare};
