(()=>{'use strict';
 let busy=false;
 const permitted=()=>!appState.isLocked&&can('sets_backup');
 const notify=(message,type='info')=>showToast(message,type);
 function secretDialog({creating=false,pin=false,title}={}){
  if(document.getElementById('backupSecret402'))return Promise.resolve(null);
  return new Promise(resolve=>{
   const panel=document.createElement('div');panel.id='backupSecret402';panel.className='fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4';
   panel.style.zIndex='10000';
   panel.innerHTML='<form role="dialog" aria-modal="true" aria-labelledby="backupSecretTitle402" dir="rtl" class="bg-white text-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg space-y-4"><h2 id="backupSecretTitle402" class="text-lg font-black"></h2><p id="backupSecretHelp402" class="text-sm text-slate-600"></p><label class="block text-sm font-bold">كلمة مرور النسخة<input id="backupPassword402" type="password" autocomplete="off" class="block border rounded-lg p-3 w-full mt-2" maxlength="1024"></label><label id="backupConfirmWrap402" class="block text-sm font-bold">تأكيد كلمة المرور<input id="backupConfirm402" type="password" autocomplete="new-password" class="block border rounded-lg p-3 w-full mt-2" maxlength="200"></label><p id="backupSecretError402" role="alert" class="text-sm text-rose-700"></p><div class="flex gap-2"><button id="backupSecretSubmit402" type="submit" class="bg-teal-700 text-white p-3 rounded-lg flex-1 font-bold"></button><button id="backupSecretCancel402" type="button" class="border p-3 rounded-lg">إلغاء</button></div></form>';
   (pin&&appState.isLocked?document.getElementById('lockScreenOverlay'):document.body).append(panel);
   const input=panel.querySelector('#backupPassword402'),confirm=panel.querySelector('#backupConfirm402'),error=panel.querySelector('#backupSecretError402');
   panel.querySelector('h2').textContent=title||(creating?'حفظ نسخة ZIP كاملة':'فتح نسخة احتياطية');
   panel.querySelector('#backupSecretHelp402').textContent=creating?'اختر كلمة مرور من 12 إلى 200 رمز واحفظها خارج الكمبيوتر. ملف ZIP يشمل البيانات والمرفقات، ويُفتح على جهاز آخر بكلمة المرور نفسها.':'لملفات ZIP والنسخ المحمولة: أدخل كلمة المرور التي اخترتها عند الحفظ. للنسخ المحلية القديمة ALHBAK أو JSON: اتركها فارغة. اختر ملف النسخة نفسه دون فك ضغطه.';
   panel.querySelector('#backupConfirmWrap402').hidden=!creating;
   panel.querySelector('#backupSecretSubmit402').textContent=creating?'متابعة واختيار مكان الحفظ':'متابعة واختيار النسخة';
   if(pin){panel.querySelector('#backupSecretHelp402').textContent='أدخل PIN المدير الحالي لإصدار مفتاح طوارئ جديد. إصدار مفتاح جديد يُلغي المفتاح السابق.';input.parentElement.firstChild.textContent='PIN المدير الحالي';input.inputMode='numeric';input.maxLength=8;panel.querySelector('#backupSecretSubmit402').textContent='متابعة';}
   input.autocomplete=creating?'new-password':'off';if(creating)input.maxLength=200;
   const previous=document.activeElement;
   const finish=value=>{panel.remove();previous?.focus?.();resolve(value);};
   panel.querySelector('#backupSecretCancel402').onclick=()=>finish(null);
   panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();finish(null);}});
   panel.querySelector('form').onsubmit=event=>{
    event.preventDefault();
    if(creating&&(input.value.length<12||input.value.length>200)){error.textContent='كلمة المرور يجب أن تكون من 12 إلى 200 رمز.';input.focus();return;}
    if(creating&&input.value!==confirm.value){error.textContent='كلمتا المرور غير متطابقتين.';confirm.focus();return;}
    finish(input.value);
   };
   input.focus();
  });
 }
 async function run(action){
  if(busy)return;busy=true;
  const buttons=[...document.querySelectorAll('[data-backup-action402]')],previous=buttons.map(b=>b.disabled);
  buttons.forEach(b=>b.disabled=true);
  try{return await action();}
  catch(error){notify(error.message||'تعذر تنفيذ عملية النسخ الاحتياطي. لم يتم اعتماد الاسترجاع.','danger');}
  finally{buttons.forEach((b,i)=>b.disabled=previous[i]);busy=false;}
 }
 async function exportBackup(){
  if(!permitted())return permDeny();if(busy)return;
  const password=await secretDialog({creating:true});if(password===null)return;
  return run(async()=>{
   notify('جارٍ إنشاء النسخة الكاملة والتحقق منها…');
   const result=await window.api.backupZip402(password);
   if(result?.ok)notify('تم حفظ النسخة الكاملة بنجاح: '+result.name,'success');
   return result;
  });
 }
 async function restoreBackup(){
  if(!permitted())return permDeny();if(busy)return;
  const password=await secretDialog({title:'استرجاع نسخة احتياطية'});if(password===null)return;
  requireAdminPin('سيتم فحص النسخة أولاً، وحفظ نسخة أمان من البيانات الحالية قبل استبدالها. بعد الاسترجاع ستسجّل الدخول بحسابات النسخة المسترجعة.',()=>run(async()=>{
   const result=await window.api.opsRestoreBackup(password||null);
   if(result?.ok){notify('تم الاسترجاع بنجاح. جارٍ إعادة فتح البرنامج…','success');location.reload();}
   return result;
  }));
 }
 async function verifyBackup(){
  if(!permitted())return permDeny();if(busy)return;
  const password=await secretDialog({title:'فحص نسخة دون تغيير البيانات'});if(password===null)return;
  return run(async()=>{
   const result=await window.api.opsVerifyBackup(password||null);
   if(result?.ok)notify('النسخة سليمة: '+result.orders+' فاتورة، '+result.items+' صنف، '+result.treasury+' حركة خزينة، '+(result.attachments||0)+' مرفق. لم تتغير بياناتك.','success');
   return result;
  });
 }
 addEventListener('DOMContentLoaded',()=>{if(!window.api?.nativeDesktop)return;try{const warning=window.api.appInfo().backupWarning;if(warning){const notice=document.createElement('p');notice.id='backupStartupWarning402';notice.className='border border-amber-300 rounded-xl bg-amber-50 text-amber-900 p-4 text-sm';notice.textContent='لم تنجح النسخة التلقائية عند بدء التشغيل: '+warning+' اختر مجلدًا متاحًا أو احفظ نسخة ZIP كاملة.';document.getElementById('subtab-backupTab')?.prepend(notice);}}catch(_){}},{once:true});
 window.Backup402UI=Object.freeze({exportBackup,restoreBackup,verifyBackup,secretDialog});
})();
