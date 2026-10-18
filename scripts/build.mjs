import {mkdir,rm,copyFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),out=new URL('dist/',root);
await rm(out,{recursive:true,force:true});await mkdir(new URL('vendor/',out),{recursive:true});
const files=['index.html','style.css','app.js','sculpture.js','collection.js','vendor/three.module.js','vendor/three.core.js','vendor/THREE-LICENSE.txt','LICENSE'];
for(const file of files)await copyFile(new URL(file,root),new URL(file,out));
const manifest=[];for(const file of files)manifest.push({file,sha256:createHash('sha256').update(await readFile(new URL(file,out))).digest('hex')});
console.log(JSON.stringify(manifest,null,2));
