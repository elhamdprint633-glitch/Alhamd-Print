/* Device-local geometry. Screen layout never changes invoice paper or business data. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),storageKey='alhamd-layout-145';
 let saved={};try{localStorage.removeItem(storageKey);}catch{}
 const surfaces=new Map();let hover=null,drag=null,schedule=0,suppressClickUntil=0;
 const css=document.createElement('style');css.textContent=`@media screen{
 #sidebarEdge144{display:none!important}
 body:not(.sb-collapsed) #sidebar{width:var(--sidebar-user-width145,16rem)!important}
 body.sb-collapsed #sidebar .nav-btn:hover::after{display:none!important}
 body.resize-hover145,body.resize-hover145 *{cursor:var(--resize-cursor145)!important}
 body.resize-drag145 #sidebar{transition:none!important}
 #sidebarResizeRail145{position:fixed;width:8px;z-index:46;cursor:ew-resize;background:transparent;touch-action:none}
 #sidebarResizeRail145[hidden]{display:none!important}
 body.resize-drag145,body.resize-drag145 *{user-select:none!important}
 .nav-tip145{position:fixed;z-index:45000;pointer-events:none;max-width:min(280px,calc(100vw - 16px));padding:8px 12px;border:1px solid #64748b;border-radius:10px;background:#0f172a;color:white;font-size:12px;font-weight:700;box-shadow:0 8px 24px #0005;direction:rtl}
 .nav-tip145[hidden]{display:none!important}
 }@media print{#sidebarResizeRail145,.nav-tip145{display:none!important}.app-dialog144>.dialog-card144{width:auto!important;height:auto!important;max-width:none!important;max-height:none!important;overflow:visible!important}}
 `;document.head.append(css);
 const rail=document.createElement('div');rail.id='sidebarResizeRail145';rail.setAttribute('role','separator');rail.setAttribute('aria-orientation','vertical');rail.setAttribute('aria-label','تغيير عرض القائمة الجانبية بالسحب');rail.tabIndex=0;document.body.append(rail);
 function placeRail(){rail.hidden=true;rail.style.display='none';}
 if($('sidebar'))new ResizeObserver(placeRail).observe($('sidebar'));new MutationObserver(placeRail).observe(document.body,{attributes:true,attributeFilter:['class']});window.addEventListener('resize',placeRail);placeRail();
 rail.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home'].includes(e.key))return;e.preventDefault();const side=$('sidebar'),meta=surfaces.get(side);if(!meta)return;if(e.key==='Home'){document.body.style.removeProperty('--sidebar-user-width145');delete saved.sidebar;persist();return;}apply(side,meta,{w:side.getBoundingClientRect().width+(e.key==='ArrowLeft'?20:-20),h:0});saved.sidebar={w:side.getBoundingClientRect().width,h:0};persist();});
 const tip=document.createElement('div');tip.className='nav-tip145';tip.hidden=true;tip.setAttribute('role','tooltip');tip.id='sidebarTooltip145';document.body.append(tip);let tipButton=null;
 function hideTip(){tip.hidden=true;if(tipButton)tipButton.removeAttribute('aria-describedby');tipButton=null;}
 function showTip(button){if(!document.body.classList.contains('sb-collapsed')||button.closest('#sidebar')===null)return hideTip();const text=button.querySelector('.sb-label')?.textContent.trim()||button.dataset.tip||button.getAttribute('aria-label');if(!text)return;tipButton=button;tip.textContent=text;tip.hidden=false;button.setAttribute('aria-describedby',tip.id);const r=button.getBoundingClientRect(),s=$('sidebar').getBoundingClientRect();tip.style.left=Math.max(8,s.left-tip.offsetWidth-10)+'px';tip.style.top=Math.max(8,Math.min(innerHeight-tip.offsetHeight-8,r.top+(r.height-tip.offsetHeight)/2))+'px';}
 document.addEventListener('pointerover',e=>{const b=e.target.closest?.('#sidebar .nav-btn');if(b&&!b.contains(e.relatedTarget))showTip(b);});
 document.addEventListener('pointerout',e=>{if(tipButton&&tipButton.contains(e.target)&&!tipButton.contains(e.relatedTarget))hideTip();});
 document.addEventListener('focusin',e=>{const b=e.target.closest?.('#sidebar .nav-btn');if(b)showTip(b);else hideTip();});
 document.addEventListener('focusout',e=>{if(tipButton&&!tipButton.contains(e.relatedTarget))hideTip();});
 document.addEventListener('scroll',hideTip,true);
 const persist=()=>{try{localStorage.setItem(storageKey,JSON.stringify(saved));}catch{}};
 const clamp=(n,a,b)=>Math.max(Math.min(a,b),Math.min(b,n));
 function limits(node,kind){const r=node.getBoundingClientRect(),parent=node.parentElement?.getBoundingClientRect();if(kind==='sidebar')return{minW:180,maxW:Math.min(480,innerWidth*.42),minH:0,maxH:innerHeight};const floating=kind==='dialog'||kind==='menu',maxW=floating?innerWidth-24:Math.max(innerWidth*2,parent?.width||innerWidth-24);let maxH=innerHeight-24;if(kind==='workspace')maxH=Math.max(180,innerHeight-document.querySelector('main>header').getBoundingClientRect().height-24);return{minW:Math.min(280,maxW),maxW,minH:Math.min(180,maxH),maxH};}
 function apply(node,meta,dimensions){const l=limits(node,meta.kind),w=clamp(dimensions.w,l.minW,l.maxW),h=clamp(dimensions.h,l.minH,l.maxH);
  if(meta.kind==='sidebar'){document.body.style.setProperty('--sidebar-user-width145',w+'px');return;}
  node.style.setProperty('width',w+'px','important');node.style.setProperty('max-width','100%','important');
  if(meta.kind==='dialog')node.style.setProperty('max-width','calc(100vw - 24px)','important');
  node.style.setProperty('height',h+'px','important');node.style.setProperty('max-height',l.maxH+'px','important');
  if(node.id!=='modalPrintInvoice'&&node.parentElement?.id!=='modalPrintInvoice')node.style.setProperty('overflow','auto','important');
  node.style.minWidth='0';node.style.minHeight='0';node.style.boxSizing='border-box';
  if(meta.kind==='table'||meta.kind==='workspace'||meta.kind==='panel'){node.style.marginInline='auto';node.style.flexShrink='0';}
  if(meta.kind==='menu'){const r=node.getBoundingClientRect();node.style.left=clamp(r.left,8,innerWidth-w-8)+'px';node.style.right='auto';node.style.top=clamp(r.top,8,innerHeight-h-8)+'px';}
 }
 function add(node,key,kind){if(!node||surfaces.has(node))return;const meta={key,kind,original:node.style.cssText};surfaces.set(node,meta);node.dataset.resizeSurface145=key;}
 function discover(){schedule=0;
  add($('sidebar'),'sidebar','sidebar');
  document.querySelectorAll('.app-dialog144').forEach(m=>{if(m.id==='lockScreenOverlay'||m.id==='modalSecurityPin')return;add(m.firstElementChild,'dialog:'+m.id,'dialog');});
  document.querySelectorAll('#colsPanel,#privPanel,.mini-calendar-139,#saleSuggestionPopup136').forEach(m=>add(m,'menu:'+m.id,'menu'));
  for(const [node] of surfaces)if(!node.isConnected)surfaces.delete(node);
 }
 const obs=new MutationObserver(records=>{if(records.some(r=>r.addedNodes.length)&&!schedule)schedule=setTimeout(discover,0);});obs.observe(document.body,{childList:true,subtree:true});window.addEventListener('DOMContentLoaded',()=>setTimeout(discover,0));discover();
 function hit(e){return null;if(window.__layout151)return null;if(e.target.closest?.('button,[role="button"],.act-icon-btn,.window-tools150,.window-grip150,.field-grip150'))return null;if(e.target.closest?.('[data-resize148]'))return null;if(e.pointerType&&e.pointerType!=='mouse'&&e.pointerType!=='pen')return null;const sidebar=$('sidebar');
  if(e.target===rail&&!rail.hidden)return{node:sidebar,meta:surfaces.get(sidebar),x:'w',y:''};
  if(sidebar&&innerWidth>=768&&!document.body.classList.contains('sb-collapsed')){const r=sidebar.getBoundingClientRect();if(sidebar.contains(e.target)&&Math.abs(e.clientX-r.left)<=5&&e.clientY>r.top+6&&e.clientY<r.bottom-6&&!e.target.closest('.app-dialog144'))return{node:sidebar,meta:surfaces.get(sidebar),x:'w',y:''};}
  const list=[];for(const [node,meta] of surfaces){if(meta.kind==='sidebar'||!node.contains(e.target)||node.closest('.hidden'))continue;const r=node.getBoundingClientRect();if(r.width<80||r.height<50)continue;const x=Math.abs(e.clientX-r.left)<=5?'w':Math.abs(e.clientX-r.right)<=5?'e':'',y=Math.abs(e.clientY-r.top)<=5?'n':Math.abs(e.clientY-r.bottom)<=5?'s':'';if(x||y)list.push({node,meta,x,y,area:r.width*r.height});}return list.sort((a,b)=>a.area-b.area)[0]||null;
 }
 function setHover(next){hover=next;document.body.classList.toggle('resize-hover145',!!next);if(next)document.body.style.setProperty('--resize-cursor145',next.x&&next.y?(next.x==='w'&&next.y==='n'||next.x==='e'&&next.y==='s'?'nwse-resize':'nesw-resize'):next.x?'ew-resize':'ns-resize');}
 document.addEventListener('pointermove',e=>{if(!drag){setHover(hit(e));return;}if(e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y,factor=drag.meta.kind==='dialog'||drag.meta.kind==='workspace'?2:1;let w=drag.w,h=drag.h;if(drag.edgeX)w+=dx*(drag.edgeX==='w'?-1:1)*(drag.meta.kind==='sidebar'?1:factor);if(drag.edgeY)h+=dy*(drag.edgeY==='n'?-1:1)*(drag.meta.kind==='dialog'?2:1);apply(drag.node,drag.meta,{w,h});e.preventDefault();},true);
 document.addEventListener('pointerdown',e=>{if(e.button!==0||drag)return;const at=hit(e);if(!at||!at.meta)return;const r=at.node.getBoundingClientRect();drag={...at,id:e.pointerId,x:e.clientX,y:e.clientY,w:r.width,h:r.height,edgeX:at.x,edgeY:at.y,before:at.node.style.cssText,sidebarBefore:document.body.style.getPropertyValue('--sidebar-user-width145')};setHover(at);hideTip();document.body.classList.add('resize-drag145');try{document.documentElement.setPointerCapture(e.pointerId);}catch{}e.preventDefault();e.stopImmediatePropagation();},true);
 function finish(cancel=false){if(!drag)return;const d=drag;drag=null;suppressClickUntil=Date.now()+250;if(cancel){d.node.style.cssText=d.before;if(d.meta.kind==='sidebar')document.body.style.setProperty('--sidebar-user-width145',d.sidebarBefore);}else{const r=d.node.getBoundingClientRect();saved[d.meta.key]={w:r.width,h:d.meta.kind==='sidebar'?0:r.height};persist();}try{document.documentElement.releasePointerCapture(d.id);}catch{}document.body.classList.remove('resize-drag145');setHover(null);}
 document.addEventListener('click',e=>{if(Date.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('pointerup',e=>{if(drag&&e.pointerId===drag.id){finish();e.preventDefault();e.stopImmediatePropagation();}},true);
 document.addEventListener('pointercancel',()=>finish(true),true);window.addEventListener('blur',()=>{finish(true);setHover(null);hideTip();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag){finish(true);e.preventDefault();e.stopImmediatePropagation();}},true);

 window.ResetLegacy145=()=>{for(const[node,meta]of surfaces)node.style.cssText=meta.original;document.body.style.removeProperty('--sidebar-user-width145');saved={};persist();};
 window.addEventListener('resize',()=>{hideTip();if(drag)finish(true);for(const [node,meta] of surfaces)if(saved[meta.key]&&node.getClientRects().length)apply(node,meta,saved[meta.key]);});
})();
