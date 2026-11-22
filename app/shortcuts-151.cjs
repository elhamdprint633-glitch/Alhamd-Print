'use strict';
const M=require('./studio-150-model.js');
function install({ipcMain,allowed,store,getWin}){let context={recording:false,editing:false},signature='',bindings=M.shortcuts(),revision=-1,locked=true;
ipcMain.on('shortcut-context151',(e,c)=>{allowed(e);context={recording:c?.recording===true,editing:c?.editing===true};});
getWin().webContents.on('before-input-event',(event,input)=>{if(input.type!=='keyDown'||context.recording)return;if(revision!==store.revision){revision=store.revision;const s=JSON.parse(store.load()||'{}');locked=!!s.isLocked;const raw=s.shopSettings?.shortcuts150||{},str=JSON.stringify(raw);if(str!==signature){signature=str;bindings=M.shortcuts(raw);}}const c=M.chord(input),a=Object.entries(bindings).find(([,v])=>v&&v===c)?.[0];if(!a||locked&&!['zoomIn','zoomOut','zoomReset','fullscreen'].includes(a)||context.editing&&M.plain(c))return;event.preventDefault();if(input.isAutoRepeat&&!a.startsWith('zoom'))return;getWin().webContents.send('shortcut151',a);});
getWin().webContents.on('blur',()=>context={recording:false,editing:false});}
module.exports={install};
