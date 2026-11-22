'use strict';
const MARKER='$native650$';
const clone=v=>JSON.parse(JSON.stringify(v));
function users650(users){return (users||[]).map(u=>({...u,pin:MARKER}));}
function public650(s){if(!s)return null;const shop=s.shopSettings||{};return {_public650:true,isLocked:true,currentUser:s.currentUser,users:(s.users||[]).map(u=>({id:u.id,name:u.name,username:u.username,role:u.role,pin:MARKER,pinLength:u.pinLength||4,pinDefault:!!u.pinDefault})),shopSettings:Object.fromEntries(['name','subTitle','logo','ui'].filter(k=>shop[k]!==undefined).map(k=>[k,clone(shop[k])])),orders:[],items:[],clients:[],suppliers:[],purchases:[],treasury:[],services:[],quotes:[],adjustments:[]};}
function project(s,authenticated){if(!s)return null;const value=typeof s==='string'?JSON.parse(s):s;if(!authenticated)return JSON.stringify(public650(value));const out=clone(value);out.users=users650(out.users);delete out._public650;delete out.auditTrail166;return JSON.stringify(out);}
function mergePins(prior,next){const old=new Map((prior.users||[]).map(u=>[String(u.id),u]));for(const u of next.users||[])if(u.pin===MARKER||u.pin===undefined){const p=old.get(String(u.id));if(!p)throw Error('اختر PIN صالحًا للحساب الجديد');u.pin=p.pin;}return next;}
module.exports={MARKER,project,mergePins,public650};
