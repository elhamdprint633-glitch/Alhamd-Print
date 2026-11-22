/*
 * One vertical scroll owner for the whole desktop/mobile workspace.
 * Normal page and table wheel events stay native; table wrappers own X only.
 * If the pointer is over the sidebar and it has no room to scroll (or reached
 * its edge), forward vertical wheel motion to the main viewport. This prevents
 * the sidebar sibling from becoming a dead-end scroll area.
 */
(()=>{'use strict';
const main=document.querySelector('body > main');
if(main){main.id='appMainScroll153';main.tabIndex=-1;}
const sidebar=document.querySelector('body > aside#sidebar');
const tableOf=el=>el?.closest?.('.overflow-x-auto,[data-table-scroll],.table-scroll-wrap');
const canMove=(el,delta)=>!!el&&(el.scrollWidth-el.clientWidth>2)&&(delta<0?el.scrollLeft>1:el.scrollLeft<el.scrollWidth-el.clientWidth-1);
const canScrollY=(el,delta)=>!!el&&el.scrollHeight-el.clientHeight>2&&(delta<0?el.scrollTop>1:el.scrollTop<el.scrollHeight-el.clientHeight-1);
window.addEventListener('wheel',e=>{
 if(e.defaultPrevented||e.ctrlKey||e.metaKey||!e.cancelable)return;
 const target=e.target instanceof Element?e.target:null;
 // Keep horizontal table navigation native unless the user asks for Shift+wheel.
 if(e.shiftKey||Math.abs(e.deltaX)>Math.abs(e.deltaY)){
  const table=tableOf(target);if(!table)return;
  const delta=e.deltaX||e.deltaY;if(!canMove(table,delta))return;
  table.scrollLeft+=delta;if(table.scrollLeft!==0)e.preventDefault();
  return;
 }
 // The sidebar is a sibling of main, so browser scroll chaining cannot reach
 // the workspace. Forward only when the sidebar cannot consume this delta.
 if(sidebar&&target?.closest?.('#sidebar')&&Math.abs(e.deltaY)>0){
  const navEl=sidebar.querySelector('#sidebarNavScroll, nav');
  if((sidebar.dataset.pinMode==='both'||!sidebar.dataset.pinMode)&&navEl){
   if(target.closest('#sidebarNavScroll, nav')&&canScrollY(navEl,e.deltaY))return;
   if(!target.closest('#sidebarNavScroll, nav')&&canScrollY(navEl,e.deltaY)){navEl.scrollTop+=e.deltaY;e.preventDefault();return;}
  }
 }
 if(sidebar&&main&&target?.closest?.('#sidebar')&&Math.abs(e.deltaY)>0&&!canScrollY(sidebar,e.deltaY)&&main.scrollHeight>main.clientHeight+1){
  main.scrollTop+=e.deltaY;e.preventDefault();
 }
},{capture:true,passive:false});
window.ScrollFix153={viewport:()=>main,sidebar:()=>sidebar,tableOf,canMove,canScrollY};
})();
