from pathlib import Path
import re
p=Path(__file__).resolve().parents[1]/'app';entries=['financial-integrity-166.cjs','server-permissions-166.cjs','renderer-state-650.cjs','workspace-650.js','corrections-650.js','sales-returns-640.js','party-ledger-411.js','external-services-407.js','treasury-discounts-408.js','workflow-650.js'];modules={}
def collect(name):
 if name in modules:return
 s=(p/name).read_text();modules[name]=s
 for dependency in re.findall(r"require\(['\"](\./[^'\"]+|node:crypto)['\"]\)",s):
  if dependency=='node:crypto':continue
  collect(dependency[2:])
for name in entries:collect(name)
header="""/* Generated from the same desktop validation sources; run build/bundle-mobile-guard.py to regenerate. */
(function(root){'use strict';const modules=Object.create(null),cache=Object.create(null);function require(name){if(name==='node:crypto')return{randomUUID:()=>crypto.randomUUID()};name=name.replace(/^\\.\\//,'');if(cache[name])return cache[name].exports;if(!modules[name])throw Error('Unsupported guard module: '+name);const m={exports:{}};cache[name]=m;modules[name](m,m.exports,require);return m.exports;}
"""
body=''.join('modules['+repr(name)+']=function(module,exports,require){\n'+s+'\n};\n' for name,s in modules.items())
footer="""
function validate(prior,next,user,restoring=false){if(!next||!Array.isArray(next.users)||!Array.isArray(next.orders))throw Error('بيانات محاسبية غير صالحة');const R=require('./renderer-state-650.cjs');if(prior)R.mergePins(prior,next);require('./permissions-650.js').migrate(next);if(!restoring&&prior&&user){if(String(next.currentUser)!==String(user.id))throw Error('تبديل المستخدم يحتاج PIN');require('./server-permissions-166.cjs').assertChanges(prior,next,user);require('./workspace-650.js').assertPrefs(prior,next,user);require('./workflow-650.js').assertTransition(prior,next,user);}require('./quick-access-651.js').validatePreferences(next);require('./financial-integrity-166.cjs').validate(next);require('./workspace-650.js').allocations(next);require('./corrections-650.js').assertTransition(restoring?next:prior||{},next);require('./sales-returns-640.js').validate(next);if(prior&&!restoring)require('./sales-returns-640.js').assertTransition(prior,next);require('./party-ledger-411.js').validate(next);require('./external-services-407.js').validate(next);require('./treasury-discounts-408.js').validate(next);require('./operations-149-model.js').validateOperations(next);if(prior&&!restoring){const ids=new Set((next.orders||[]).map(o=>o.id));if((next.adjustments||[]).some(a=>a.orderId&&!ids.has(a.orderId)&&(prior.orders||[]).some(o=>o.id===a.orderId)))throw Error('لا يمكن حذف فاتورة لها تسوية');for(const old of prior.orders||[]){const current=next.orders.find(o=>o.id===old.id);if(!current)continue;for(const k of ['ops149','costSnapshot149','paymentParts149','attachments149'])if(old[k]!==undefined&&current[k]===undefined)throw Error('التعديل يفقد بيانات الفاتورة');}for(const o of next.orders)if(o.draftId640&&next.orders.some(v=>v.id!==o.id&&v.draftId640===o.draftId640))throw Error('المسودة سبق حفظها');}if(prior&&!restoring)require('./financial-integrity-166.cjs').preserveDeletionLog(next,prior);return next;}
root.LocalGuard700={validate};if(typeof module==='object')module.exports=root.LocalGuard700;
})(globalThis);
"""
(p/'local-guard-700.js').write_text(header+body+footer)
print('Bundled local accounting guard modules',len(modules))
