'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
class InvoiceDraft640{
 constructor({dir,store,atomic}){this.dir=dir;this.store=store;this.atomic=atomic;}
 file(user){return path.join(this.dir,'invoice-draft640-'+crypto.createHash('sha256').update(String(user)).digest('hex')+'.enc');}
 save(user,data){if(!data||typeof data!=='object'||typeof data.id!=='string'||!Array.isArray(data.lines)||data.lines.length>1000)throw Error('مسودة الفاتورة غير صالحة');const text=JSON.stringify({...data,userId:String(user),savedAt:new Date().toISOString()});if(Buffer.byteLength(text)>2*1024*1024)throw Error('مسودة الفاتورة أكبر من الحد المدعوم');this.atomic(this.file(user),this.store.encode(text,'draft:'+String(user)));return {ok:true,savedAt:JSON.parse(text).savedAt};}
 get(user){const file=this.file(user);if(!fs.existsSync(file))return null;const data=JSON.parse(this.store.decode(fs.readFileSync(file,'utf8'),'draft:'+String(user),true));if(data.userId!==String(user))throw Error('المسودة تخص مستخدمًا آخر');const s=JSON.parse(this.store.load(false)||'{}');if([...(s.orders||[]),...(s.quotes||[])].some(x=>x.draftId640===data.id)){this.clear(user,data.id);return null;}return data;}
 clear(user,id){const file=this.file(user);if(!fs.existsSync(file))return true;const data=JSON.parse(this.store.decode(fs.readFileSync(file,'utf8'),'draft:'+String(user),true));if(data.id!==id)return false;fs.unlinkSync(file);return true;}
}
module.exports={InvoiceDraft640};
