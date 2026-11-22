(async()=>{
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 check(window.__stateReady&&!window.__startupError,'startup failure');
 gid('lockPinInput').value='1234';await unlockSystem();check(!appState.isLocked,'unlock');
 appState.autoBackupConfig.onActions=false;appState.autoBackupConfig.intervalMinutes='disabled';setupAutoBackupScheduler();
 appState.clients=[{id:'c',name:'عميل اختبار النسخ',initialBalance:0}];
 appState.orders=[{id:'o',orderNo:'1001',clientId:'c',clientName:'عميل اختبار النسخ',date:todayStr(),total:100,paid:0}];saveState(false);
 const [file]=await window.api.opsAddAttachments('o');check(file?.file,'native attachment picker');
 appState.orders[0].attachments149=[file,{id:'embedded',name:'صورة مدمجة',file:'inline.png',size:3,dataUrl:'data:image/png;base64,YWJj'}];
 appState.alertAttachments149={general:[file]};saveState(false);
 switchTab('operations');Operations149UI.render();
 check(!document.getElementById('opsTabs149').textContent.includes('فحص النسخ'),'duplicate operations backup tab');
 check(document.getElementById('opsTabs149').textContent.includes('سجل المراجعة'),'audit tab retained');
 switchTab('settings');switchSettingsTab('backupTab');
 check(!document.getElementById('restoreFileInput'),'duplicate browser chooser');
 const pass='Native-backup-password-402';
 const fill=(creating=false)=>{
  const panel=gid('backupSecret402');check(panel,'password dialog missing');
  gid('backupPassword402').value=pass;
  if(creating){gid('backupConfirm402').value='mismatch';panel.querySelector('form').requestSubmit();check(!!gid('backupSecretError402').textContent,'confirmation mismatch not caught');gid('backupConfirm402').value=pass;}
  panel.querySelector('form').requestSubmit();
 };
 const save=downloadBackup();fill(true);const exported=await save;check(exported?.ok&&exported.format==='zip','ZIP export failed');
 appState.orders[0].total=200;saveState(false);
 const verifying=Backup402UI.verifyBackup();fill();const verified=await verifying;check(verified?.ok&&verified.attachments===1,'ZIP verify failed');
 check(appState.orders[0].total===200,'verify changed live state');
 // Wrong password must be shown as a toast; it must not open the fatal diagnostics screen.
 const wrong=Backup402UI.verifyBackup();gid('backupPassword402').value='wrong-password-402';gid('backupSecret402').querySelector('form').requestSubmit();await wrong;
 check(!window.__startupError,'verification error reached fatal diagnostics');
 await triggerRestoreBackupAfterPassword();
 async function triggerRestoreBackupAfterPassword(){const restoring=triggerRestoreBackup();fill();await restoring;}
 check(!gid('modalSecurityPin').classList.contains('hidden'),'restore admin confirmation missing');
 check(!window.__startupError,'restore setup used unsupported prompt');
 return {exported:true,verified:true,passwordMismatchCaught:true,wrongPasswordHandled:true,auditRetained:true,duplicateBackupPaneRemoved:true};
})()
