'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const {execFile} = require('node:child_process');
const {promisify} = require('node:util');
const run = promisify(execFile);
const HELP = Object.freeze({windows:'https://tailscale.com/download/windows', android:'https://play.google.com/store/apps/details?id=com.tailscale.ipn', account:'https://login.tailscale.com/admin/machines'});
function isTailscaleIP(value) { const p=String(value||'').split('.'); return p.length===4&&p.every(x=>/^(0|[1-9][0-9]{0,2})$/.test(x)&&Number(x)<256)&&p[0]==='100'&&Number(p[1])>=64&&Number(p[1])<=127; }
function parseStatus(raw) {
  const data=typeof raw==='string'?JSON.parse(raw):raw;
  const addresses=(data.Self?.TailscaleIPs||data.TailscaleIPs||[]).filter(isTailscaleIP);
  return {installed:true,running:data.BackendState==='Running',state:String(data.BackendState||'Unknown'),ip:addresses[0]||'',addresses,online:data.Self?.Online===true};
}
async function status({platform=process.platform,env=process.env,exists=fs.existsSync,execute=run}={}) {
  const candidates=platform==='win32'?[path.join(env.ProgramFiles||'C:\\Program Files','Tailscale','tailscale.exe'),path.join(env['ProgramFiles(x86)']||'C:\\Program Files (x86)','Tailscale','tailscale.exe')]:['/usr/bin/tailscale','/usr/local/bin/tailscale','/Applications/Tailscale.app/Contents/MacOS/Tailscale'];
  const executable=candidates.find(exists);
  if(!executable)return {installed:false,running:false,state:'NotInstalled',ip:'',addresses:[]};
  try { const {stdout}=await execute(executable,['status','--json'],{timeout:4500,maxBuffer:1024*1024,windowsHide:true});return parseStatus(stdout); }
  catch { return {installed:true,running:false,state:'Unavailable',ip:'',addresses:[],message:'افتح Tailscale وسجّل الدخول وشغّل الاتصال، ثم اضغط تحديث الحالة.'}; }
}
function allowsPeer(address) { const ip=String(address||'').replace(/^::ffff:/,'');if(isTailscaleIP(ip))return true;const p=ip.split('.').map(Number);return ip==='127.0.0.1'||ip==='::1'||p.length===4&&(p[0]===10||p[0]===192&&p[1]===168||p[0]===172&&p[1]>=16&&p[1]<=31||p[0]===169&&p[1]===254); }
module.exports={status,parseStatus,isTailscaleIP,allowsPeer,HELP};
