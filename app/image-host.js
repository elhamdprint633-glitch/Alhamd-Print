import './image-crop-410.js';
import * as pdfjs from './assets/pdfjs/pdf.mjs';
pdfjs.GlobalWorkerOptions.workerSrc=new URL('./assets/pdfjs/pdf.worker.mjs',location.href).href;
let pdf=null;
window.imageReady150=true;
window.openImagePDF150=async bytes=>{pdf=await pdfjs.getDocument({data:new Uint8Array(bytes),cMapUrl:new URL('./assets/pdfjs/cmaps/',location.href).href,cMapPacked:true,standardFontDataUrl:new URL('./assets/pdfjs/standard_fonts/',location.href).href,wasmUrl:new URL('./assets/pdfjs/wasm/',location.href).href,isEvalSupported:false}).promise;return pdf.numPages;};
async function canvas410(index,dpi,trim){
 const page=await pdf.getPage(index),viewport=page.getViewport({scale:dpi/72});if(viewport.width*viewport.height>32000000)throw Error('المقاس كبير جدًا؛ قلل الدقة أو حجم الورق');
 let canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);const ctx=canvas.getContext('2d',{willReadFrequently:!!trim});await page.render({canvasContext:ctx,viewport,background:'rgb(255,255,255)'}).promise;page.cleanup();
 if(trim){const b=ImageCrop410.bounds(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height,Math.ceil(dpi/12));if(b.top||b.height<canvas.height){const cut=document.createElement('canvas');cut.width=canvas.width;cut.height=b.height;cut.getContext('2d').drawImage(canvas,0,b.top,canvas.width,b.height,0,0,canvas.width,b.height);canvas.width=canvas.height=0;canvas=cut;}}
 return canvas;
}
window.renderImagePage150=async(index,dpi,format,trim=false)=>{const canvas=await canvas410(index,dpi,trim);try{return canvas.toDataURL(format==='jpg'?'image/jpeg':'image/png',.98).split(',')[1];}finally{canvas.width=canvas.height=0;}};
window.copyImagePDF407=async(options={})=>{
 let dpi=Number(options.dpi)||144;const trim=!!options.trimWhitespace410;let width,height;
 for(;;){width=0;height=0;for(let n=1;n<=pdf.numPages;n++){const p=await pdf.getPage(n),v=p.getViewport({scale:dpi/72});width=Math.max(width,Math.ceil(v.width));height+=Math.ceil(v.height);}if(width*height<=48000000&&height<=30000)break;const lower=[300,240,200,144].find(d=>d<dpi);if(!lower)throw Error('المستند طويل جدًا لصورة واحدة؛ شاركه PDF للحفاظ على كل الصفحات');dpi=lower;}
 const parts=[];try{height=0;for(let n=1;n<=pdf.numPages;n++){const part=await canvas410(n,dpi,trim);parts.push(part);height+=part.height;}
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,width,height);let y=0;for(const part of parts){ctx.drawImage(part,0,y);y+=part.height;}
 window.copyInfo410={dpi,trimmed:trim};try{return canvas.toDataURL('image/png');}finally{canvas.width=canvas.height=0;}
 }finally{for(const part of parts)part.width=part.height=0;}
};
