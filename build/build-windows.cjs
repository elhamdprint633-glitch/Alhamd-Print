// Native NSIS uninstaller extraction avoids a dependency on Wine when building on Linux.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{build,Platform,Arch}=require('electron-builder');
const {WineVmManager}=require('app-builder-lib/out/vm/WineVm');
const {UninstallerReader}=require('app-builder-lib/out/targets/nsis/nsisUtil');
const pkg=require('../package.json'),outDir=path.resolve(process.env.ALHAMD_BUILD_DIR||pkg.build.directories.output),installer=pkg.build.nsis.artifactName;
if(process.platform!=='win32'){
 const original=WineVmManager.prototype.exec;
 WineVmManager.prototype.exec=async function(file,args,options){
  if(path.dirname(file)===outDir&&path.basename(file)===installer&&(!args||!args.length))return UninstallerReader.exec(file,path.join(path.dirname(file),path.basename(file,'exe')+'__uninstaller.exe'));
  return original.call(this,file,args,options);
 };
}
if(process.argv.includes('--prepackaged')){
 const {PlatformPackager}=require('app-builder-lib/out/platformPackager');const originalDir=PlatformPackager.prototype.computeAppOutDir;
 PlatformPackager.prototype.computeAppOutDir=function(out,arch){if(!this.packagerOptions.prepackaged)return originalDir.call(this,out,arch);const dir=path.join(path.dirname(this.packagerOptions.prepackaged),arch===Arch.arm64?'win-arm64-unpacked':'win-unpacked');const bytes=fs.readFileSync(path.join(dir,'Alhamd Print.exe')),machine=bytes.readUInt16LE(bytes.readUInt32LE(60)+4);if(machine!==(arch===Arch.arm64?0xaa64:0x8664))throw Error('Wrong executable architecture: '+dir);return dir;};
}
const cachedArchive=path.join(outDir,`alhamd-print-desktop-${pkg.version}-x64.nsis.7z`);
if(fs.existsSync(cachedArchive))fs.renameSync(cachedArchive,cachedArchive+'.previous-'+Date.now());
process.env.ELECTRON_BUILDER_COMPRESSION_LEVEL ||= '3';
build({publish:'never',config:{publish:[],directories:{output:outDir}},targets:Platform.WINDOWS.createTarget(['nsis'],Arch.x64,Arch.arm64),...(process.argv.includes('--prepackaged')?{prepackaged:path.join(outDir,'win-unpacked')}:{})}).then(()=>{const artifact=path.join(outDir,installer);if(!fs.existsSync(artifact))throw Error('لم يتم إنشاء المثبّت المتوقع: '+artifact);console.log('NSIS integrity:',require('./check-installer.cjs').checkInstaller(artifact));const hash=crypto.createHash('sha256').update(fs.readFileSync(artifact)).digest('hex');fs.writeFileSync(artifact+'.sha256',`${hash}  ${path.basename(artifact)}\r\n`,'utf8');console.log('SHA-256:',hash);process.exit(0)}).catch(error=>{console.error(error);process.exit(1)});
