/* One geometry owner for floating windows. Financial state is never changed here. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),roots=new Map();
 const skip=new Set(['sidebar','sidebarOverlay','lockScreenOverlay','toastContainer','toast','workspace650Quick','colsPanel','privPanel','miniCalendarPanel139','globalSearchResults152','headerTools405','invoiceReview405','salesComposer']);
 const selector='body>.fixed,body>.app-dialog144,body>.studio-overlay150,body>.ops-modal149,body>[role=dialog],body>#workspace650Modal,body>#reviewCenter,body>#fontPicker,body>#catMgr,body>#openingDetails151,body>#shortcutGuide150,body>#shortcutSettings150';
 let order=0,queued=false,working=false;
 const shown=n=>n.isConnected&&!n.classList.contains('hidden')&&!n.closest('[hidden],.hidden')&&getComputedStyle(n).display!=='none'&&getComputedStyle(n).visibility!=='hidden';
 function css(n,k,v){if(n.style.getPropertyValue(k)!==v||n.style.getPropertyPriority(k)!=='important')n.style.setProperty(k,v,'important');}
 function bounds(){const m=document.querySelector('body>main'),h=m?.querySelector(':scope>header'),r=m?.getBoundingClientRect();return {left:Math.max(6,(r?.left||0)+7),right:Math.max(6,innerWidth-(r?.right||innerWidth)+7),top:Math.max(6,(h?.getBoundingClientRect().bottom||r?.top||0)+7),bottom:Math.max(6,innerHeight-(visualViewport?.height||innerHeight)-(visualViewport?.offsetTop||0)+7)};}
 function qualify(n){return n instanceof HTMLElement&&n.parentElement===document.body&&!skip.has(n.id)&&n.tagName!=='DIALOG'&&!n.hasAttribute('popover')&&(n.matches('.fixed,.app-dialog144,.studio-overlay150,.ops-modal149,[role=dialog]')||['workspace650Modal','reviewCenter','catMgr','fontPicker','openingDetails151','shortcutGuide150','shortcutSettings150'].includes(n.id));}
 function cardOf(n){return n.querySelector(':scope>section,:scope>form,:scope>div');}
 function observe(n,r){r.observer.disconnect();r.observer.observe(n,{attributes:true,attributeFilter:['class','hidden','style'],childList:true});r.observer.observe(r.card,{attributes:true,attributeFilter:['style','class']});}
 function register(n){if(!qualify(n)||roots.has(n))return;const card=cardOf(n);if(!card)return;const r={card,visible:false,order:0,rootStyle:'',cardStyle:''};
  r.observer=new MutationObserver(records=>{if(!n.isConnected)return;if(records.some(x=>x.type==='childList'||x.attributeName!=='style')||n.style.cssText!==r.rootStyle||r.card.style.cssText!==r.cardStyle)schedule();});
  roots.set(n,r);n.dataset.layer701='true';observe(n,r);
  n.addEventListener('pointerdown',()=>{if(r.visible&&Math.max(...[...roots.values()].filter(x=>x.visible).map(x=>x.order))!==r.order){r.order=++order;schedule();}});
 }
 function layout(){queued=false;if(working)return;working=true;try{
  for(const n of document.querySelectorAll(selector))register(n);const b=bounds();
  for(const[n,r]of roots){if(!n.isConnected){r.observer.disconnect();roots.delete(n);continue;}const hidden=n.classList.contains('hidden')||n.hasAttribute('hidden'),visible=!hidden&&(r.hiddenDisplay701||shown(n));
   if(hidden){css(n,'display','none');r.hiddenDisplay701=true;}if(visible&&!r.visible)r.order=++order;r.visible=visible;
   if(visible){r.hiddenDisplay701=false;const card=cardOf(n);if(card&&card!==r.card){r.card=card;observe(n,r);}const z=60000+r.order;
    for(const[k,v]of Object.entries({position:'fixed',left:b.left+'px',right:b.right+'px',top:b.top+'px',bottom:b.bottom+'px',width:'auto',height:'auto','max-width':'none','max-height':'none','min-width':'0px','min-height':'0px',margin:'0px',padding:'8px',transform:'none','z-index':String(z),display:n.id==='workspace650Modal'?'block':'flex','align-items':'center','justify-content':'center',overflow:'hidden'}))css(n,k,v);
    css(n,'--layer-z701',String(z));if(n.dataset.layerOrder701!==String(r.order))n.dataset.layerOrder701=String(r.order);
    const full=['modalStatement','workspace650Modal'].includes(n.id),small=['modalSecurityPin','discardWindow150','textEntryModal146','deviceAuthSettings702'].includes(n.id);
    const policy=full?'workspace':small?'compact':'form';if(n.dataset.sizePolicy702!==policy)n.dataset.sizePolicy702=policy;
    for(const[k,v]of Object.entries({width:small?'min(460px, 100%)':'100%',height:full?'100%':'auto','max-height':'100%','max-width':'100%','min-height':'0px','min-width':'0px','box-sizing':'border-box',position:'relative',top:'auto',left:'auto',right:'auto',bottom:'auto',transform:'none',margin:'0px',overflow:'auto'}))css(r.card,k,v);
    if(full)css(n,'padding','0px');
   }
   r.rootStyle=n.style.cssText;r.cardStyle=r.card.style.cssText;
  }searchLayer();
 }finally{working=false;}}
 function searchLayer(){const box=$('globalSearchResults152'),wrap=$('globalSearchWrap152');if(!box||!wrap)return;const hidden=box.classList.contains('hidden')||document.body.classList.contains('app-locked')||(typeof appState!=='undefined'&&appState.isLocked);if(hidden){if(box.matches(':popover-open'))box.hidePopover();return;}box.setAttribute('popover','manual');if(!box.matches(':popover-open'))box.showPopover();const r=wrap.getBoundingClientRect(),m=document.querySelector('body>main')?.getBoundingClientRect(),width=Math.max(150,Math.min(480,innerWidth-16,(m?.width||innerWidth)-16)),left=Math.max((m?.left||0)+8,Math.min(r.right-width,(m?.right||innerWidth)-width-8)),top=r.bottom+6;for(const[k,v]of Object.entries({position:'fixed',inset:'auto',left:left+'px',right:'auto',top:top+'px',bottom:'auto',width:width+'px',margin:'0px','max-height':Math.max(60,Math.min(560,innerHeight-top-8))+'px',overflow:'auto'}))css(box,k,v);}
 function schedule(){if(!queued){queued=true;requestAnimationFrame(layout);}}
 function install(){for(const name of ['openModal','closeModal','renderStatement','previewStatementDocument','previewInvoice','toggleSidebar','updateAllUI','showLockScreen']){const old=window[name];if(typeof old==='function')window[name]=function(...args){const result=old.apply(this,args);if(name==='showLockScreen'){for(const[n]of roots)if(shown(n))n.classList.add('hidden');$('globalSearchResults152')?.classList.add('hidden');}layout();return result;};}const compact=window.compactFloatingWindowSize163;if(typeof compact==='function')window.compactFloatingWindowSize163=function(root,...a){if(qualify(root)||root?.closest('[data-layer701]'))return false;return compact.call(this,root,...a);};layout();}
 new MutationObserver(records=>{let relevant=false;for(const r of records)for(const n of [...r.addedNodes,...r.removedNodes])if(n.nodeType===1&&(roots.has(n)||qualify(n))){if(n.isConnected)register(n);relevant=true;}if(relevant)layout();}).observe(document.body,{childList:true});
 const searchBox=$('globalSearchResults152');if(searchBox)new MutationObserver(schedule).observe(searchBox,{childList:true,attributes:true,attributeFilter:['class']});const h=document.querySelector('body>main>header');if(h)new ResizeObserver(schedule).observe(h);window.addEventListener('resize',schedule);visualViewport?.addEventListener('resize',schedule);document.querySelector('body>main')?.addEventListener('scroll',schedule,{passive:true});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();window.toggleStmtDetails701=function(button){const d=button.closest('.stmt-entry')?.querySelector('details');if(d){d.open=!d.open;button.setAttribute('aria-expanded',String(d.open));}};window.Layers701={layout,schedule,bounds,roots,qualify};
})();
