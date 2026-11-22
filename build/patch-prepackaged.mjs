import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import * as R from 'resedit';
const root=path.resolve(import.meta.dirname,'..'),pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'))),bundle=path.resolve(process.argv[2]),archive=fs.readFileSync(path.resolve(process.argv[3]));
const headerHash=crypto.createHash('sha256').update(archive.subarray(16,16+archive.readUInt32LE(12))).digest('hex');
for(const [folder,machine]of [['win-unpacked',0x8664],['win-arm64-unpacked',0xaa64]]){
 const dir=path.join(bundle,folder),file=path.join(dir,'Alhamd Print.exe'),bytes=fs.readFileSync(file);if(bytes.readUInt16LE(bytes.readUInt32LE(60)+4)!==machine)throw Error('Wrong architecture '+folder);
 fs.writeFileSync(path.join(dir,'resources/app.asar'),archive);
 const exe=R.NtExecutable.from(bytes,{ignoreCert:true}),res=R.NtExecutableResource.from(exe),entry=res.entries.find(x=>x.type==='INTEGRITY'&&x.id==='ELECTRONASAR');if(!entry)throw Error('Missing ASAR integrity');const integrity=JSON.parse(Buffer.from(entry.bin));for(const v of integrity)v.value=headerHash;entry.bin=Buffer.from(JSON.stringify(integrity));
 const vi=R.Resource.VersionInfo.fromEntries(res.entries)[0],[major,minor,patch]=pkg.version.split('.').map(Number);vi.setFileVersion(major,minor,patch,0,1033);vi.setProductVersion(major,minor,patch,0,1033);vi.outputToResourceEntries(res.entries);res.outputResource(exe);fs.writeFileSync(file,Buffer.from(exe.generate()));console.log(folder,'ASAR integrity',headerHash);
}
