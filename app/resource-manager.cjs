'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const mime=file=>({'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf'}[path.extname(file).toLowerCase()]||'application/octet-stream');
function data(file){return 'data:'+mime(file)+';base64,'+fs.readFileSync(file).toString('base64')}
function hash(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}
function copyTree(source,dest){fs.mkdirSync(dest,{recursive:true});for(const entry of fs.readdirSync(source,{withFileTypes:true})){const src=path.join(source,entry.name),out=path.join(dest,entry.name);if(entry.isDirectory())copyTree(src,out);else if(!fs.existsSync(out))fs.writeFileSync(out,fs.readFileSync(src));}}
class Resources{
 constructor(app,dataDir){this.base=app.isPackaged?path.join(process.resourcesPath,'UserAssets'):path.join(dataDir,'UserAssets');try{fs.mkdirSync(this.base,{recursive:true});fs.accessSync(this.base,fs.constants.W_OK);}catch{this.base=path.join(dataDir,'UserAssets');fs.mkdirSync(this.base,{recursive:true});}
 const fonts=path.join(this.base,'Fonts'),brand=path.join(this.base,'Branding');fs.mkdirSync(fonts,{recursive:true});fs.mkdirSync(brand,{recursive:true});
 // User changes survive startup and upgrades; only seed on the first creation.
 if(!fs.existsSync(path.join(this.base,'seed-v1.json'))){copyTree(path.join(__dirname,'assets/fonts'),path.join(fonts,'Bundled'));if(!fs.existsSync(path.join(brand,'logo.png')))fs.copyFileSync(path.join(__dirname,'assets/icon.png'),path.join(brand,'logo.png'));fs.writeFileSync(path.join(this.base,'seed-v1.json'),JSON.stringify({logo:hash(path.join(brand,'logo.png'))}));}
 this.settings=path.join(this.base,'config.json');if(!fs.existsSync(this.settings))fs.writeFileSync(this.settings,JSON.stringify({fontFile:'',logoFile:'logo.png',useFolderLogo:false},null,2));
 fs.writeFileSync(path.join(this.base,'اقرأني.txt'),'مجلد Fonts: أضف ملفات TTF أو OTF أو WOFF أو WOFF2 مباشرة هنا.\nاختيار الخط من قسم مجلد الخطوط والشعار داخل إعدادات البرنامج، أو ضع اسم ملف الخط في fontFile بملف config.json.\nمجلد Branding: استبدل logo.png بالشعار المطلوب. سيكتشف البرنامج الشعار المعدّل عند إعادة تحميل الموارد أو إعادة تشغيله. لا تغير امتداد ملف JPG إلى PNG؛ غيّر logoFile في config.json إذا استخدمت JPG.\nخطوط البرنامج الأصلية داخل Fonts/Bundled وتوجد نسخة احتياطية مدمجة داخل البرنامج أيضاً.\nاختيارات الخط والشعار داخل الإعدادات تظل متاحة. مجلد الموارد يخص نسخة التثبيت، ويُفضّل الاحتفاظ بنسخة منه قبل إزالة البرنامج أو تغيير مسار تثبيته.\n','utf8');
 }
 config(){let c;try{c=JSON.parse(fs.readFileSync(this.settings,'utf8'));}catch{throw Error('ملف config.json في مجلد الموارد غير صالح');}return c;}
 saveConfig(c){const next={...this.config(),...c};if(next.fontFile&&path.basename(next.fontFile)!==next.fontFile)throw Error('اسم خط غير صالح');if(!next.logoFile||path.basename(next.logoFile)!==next.logoFile)throw Error('اسم شعار غير صالح');fs.writeFileSync(this.settings,JSON.stringify(next,null,2));return this.list();}
 list(){const c=this.config(),fonts=[];for(const file of fs.readdirSync(path.join(this.base,'Fonts'))){const full=path.join(this.base,'Fonts',file);if(!fs.statSync(full).isFile()||!/^\.(ttf|otf|woff2?)$/i.test(path.extname(file))||fs.statSync(full).size>20*1024*1024)continue;fonts.push({name:file,family:'FolderFont_'+crypto.createHash('sha256').update(file).digest('hex').slice(0,12),data:data(full),hash:hash(full)});}
 const file=path.join(this.base,'Branding',path.basename(c.logoFile||'logo.png'));let logo=null;const seed=JSON.parse(fs.readFileSync(path.join(this.base,'seed-v1.json'),'utf8'));if(fs.existsSync(file)&&/^\.(png|jpe?g)$/i.test(path.extname(file))&&fs.statSync(file).size<10*1024*1024)logo={data:data(file),hash:hash(file),changed:hash(file)!==seed.logo};
 const css=fs.readFileSync(path.join(__dirname,'assets/fonts.css'),'utf8').replace(/url\(([^)]+)\)/g,(all,url)=>{const clean=url.replace(/^['"]|['"]$/g,'');const relative=clean.replace('./fonts/','');const external=path.join(this.base,'Fonts/Bundled',relative),fallback=path.join(__dirname,'assets/fonts',relative);return `url("${data(fs.existsSync(external)?external:fallback)}")`;});
 return {path:this.base,config:c,fonts,logo,css};}
}
module.exports={Resources};
