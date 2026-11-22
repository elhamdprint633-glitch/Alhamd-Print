(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.ImageCrop410=api;})(globalThis,function(){
 'use strict';
 function bounds(data,width,height,padding=12){
  function marked(y){for(let x=0;x<width;x++){const i=(y*width+x)*4;if(data[i+3]>20&&Math.min(data[i],data[i+1],data[i+2])<245)return true;}return false;}
  let top=0,bottom=height-1;while(top<height&&!marked(top))top++;if(top===height)return {top:0,height:Math.min(height,padding*2+1)};
  while(bottom>top&&!marked(bottom))bottom--;
  top=Math.max(0,top-padding);return {top,height:Math.min(height,bottom+padding+1)-top};
 }
 return {bounds};
});
