// Keep the local preview alive independently of the Codex terminal session.
const {spawn,execFileSync}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
// Honor the Mac's existing network proxy for public upstream metrics.
// This only affects the local preview child, not the system or deployed site.
function localEnvironment(){
 const env={...process.env,NODE_ENV:'production'};
 if(process.platform==='darwin' && !env.HTTPS_PROXY && !env.https_proxy){
  try{
   const settings=execFileSync('/usr/sbin/scutil',['--proxy'],{encoding:'utf8',timeout:2000});
   const value=key=>settings.match(new RegExp('(?:^|\\n)\\s*'+key+' : ([^\\n]+)'))?.[1].trim();
   const host=value('HTTPSProxy'),port=value('HTTPSPort');
   if(value('HTTPSEnable')==='1' && host && /^\d+$/.test(port||''))env.HTTPS_PROXY=`http://${host}:${port}`;
  }catch{/* Direct connections remain available if no system proxy is configured. */}
 }
 if(env.HTTPS_PROXY||env.https_proxy){
  env.NODE_USE_ENV_PROXY='1';
  env.NO_PROXY=[env.NO_PROXY||env.no_proxy||'','localhost','127.0.0.1','::1'].filter(Boolean).join(',');
 }
 return env;
}
let child, restartTimer, stopping=false;
function start(){
 child=spawn(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port','3000'],{cwd:root,stdio:'inherit',env:localEnvironment()});
 child.on('error',err=>console.error('[local-preview]',err.message));
 child.on('exit',()=>{child=null;if(!stopping)restartTimer=setTimeout(start,2000);else process.exit(0)});
}
function stop(){stopping=true;clearTimeout(restartTimer);if(child)child.kill('SIGTERM');else process.exit(0)}
process.on('SIGTERM',stop);process.on('SIGINT',stop);start();
