(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Alhamd148=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
 const colors={card:'#172337',card2:'#0f2e37',text:'#f8fafc',muted:'#94a3b8',label:'#e2e8f0',input:'#0f172a',inputText:'#ffffff',button:'#f5a500',buttonText:'#102134',border:'#475569',logo:'#ffffff',logoBorder:'#64748b',focus:'#f5a500'};
 const ranges={width:[280,640,384],logoSize:[40,200,80],logoScale:[20,100,100],logoRadius:[0,100,18],logoPadding:[0,24,4],radius:[0,48,24],alpha:[0,100,100],logoAlpha:[0,100,100],font:[11,24,13],titleSize:[16,36,22],borderWidth:[0,5,1],shadow:[0,70,30]};
 function login(input={}){const out={enabled:input.enabled===true,gradient:input.gradient===true,colors:{}};for(const[k,v]of Object.entries(colors))out.colors[k]=/^#[0-9a-f]{6}$/i.test(input.colors?.[k]||'')?input.colors[k]:v;for(const[k,[a,b,v]]of Object.entries(ranges))out[k]=clamp(input[k],a,b,v);return out;}
 function quick(input={}){const seen=new Set();return{count:Math.round(clamp(input.count,1,48,8)),buttons:(Array.isArray(input.buttons)?input.buttons:[]).filter(x=>x&&/^(stock|service):.+/.test(x.value)&&!seen.has(x.value)&&seen.add(x.value)).slice(0,150).map(x=>({value:String(x.value),label:String(x.label||'').slice(0,100)}))};}
 function widths(input,count){return Array.isArray(input)&&input.length===count&&input.every(x=>Number.isFinite(x)&&x>=24-0.02&&x<=8192)?input.slice():null;}
 function rgba(hex,alpha){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${Math.max(0,Math.min(100,alpha))/100})`;}
 return{login,quick,widths,rgba,colors,ranges};
});
