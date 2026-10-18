import {mkdir,rm,copyFile,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=new URL('../',import.meta.url),out=new URL('dist/',root);
const modules=['app.js','sculpture.js','collection.js','vendor/three.module.js','vendor/three.core.js'];
const allowed=new Set(modules),built=new Map(),visiting=new Set();
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
await rm(out,{recursive:true,force:true});await mkdir(new URL('vendor/',out),{recursive:true});
// Retain stable paths for older cached documents; new documents use a coherent hashed graph.
const legacy=['style.css',...modules,'vendor/THREE-LICENSE.txt','LICENSE'];
for(const file of legacy)await copyFile(new URL(file,root),new URL(file,out));
async function fingerprint(file){
  if(built.has(file))return built.get(file);
  if(!allowed.has(file)||visiting.has(file))throw new Error('Unsupported module dependency: '+file);
  visiting.add(file);let code=await readFile(new URL(file,root),'utf8');
  const imports=[...code.matchAll(/\bfrom\s*(['"])(\.[^'"]+)\1/g)];
  for(const match of imports){
    const dependency=path.posix.normalize(path.posix.join(path.posix.dirname(file),match[2]));
    const artifact=await fingerprint(dependency);
    let relative=path.posix.relative(path.posix.dirname(file),artifact);
    if(!relative.startsWith('.'))relative='./'+relative;
    code=code.replaceAll(match[1]+match[2]+match[1],match[1]+relative+match[1]);
  }
  const artifact=file.replace(/\.js$/,'.'+hash(code).slice(0,12)+'.js');
  const target=new URL('assets/'+artifact,out);await mkdir(new URL('./',target),{recursive:true});await writeFile(target,code);
  built.set(file,artifact);visiting.delete(file);return artifact;
}
const entry=await fingerprint('app.js'),css=await readFile(new URL('style.css',root));
const stylesheet='style.'+hash(css).slice(0,12)+'.css';await writeFile(new URL('assets/'+stylesheet,out),css);
const html=(await readFile(new URL('index.html',root),'utf8')).replace("import('./app.js')","import('./assets/"+entry+"')").replace('href="./style.css"','href="./assets/'+stylesheet+'"');
await writeFile(new URL('index.html',out),html);
const files=['index.html',...legacy,...[...built.values()].map(f=>'assets/'+f),'assets/'+stylesheet];
const manifest={entry:'assets/'+entry,stylesheet:'assets/'+stylesheet,modules:Object.fromEntries([...built].map(([s,f])=>[s,'assets/'+f])),files:[]};
for(const file of files)manifest.files.push({file,sha256:hash(await readFile(new URL(file,out)))});
await writeFile(new URL('asset-manifest.json',out),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest,null,2));
