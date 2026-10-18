import * as THREE from '../vendor/three.module.js';import {makeSculpture,EMITTER,wallPoint,targetContains} from '../sculpture.js';import fs from 'node:fs';
fs.mkdirSync(new URL('../test-results/',import.meta.url),{recursive:true});
const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide}),ray=new THREE.Raycaster(),results=[];
for(let index=0;index<10;index++){
 const object=makeSculpture([material],index);object.updateMatrixWorld(true);let tp=0,fp=0,fn=0,triangles=0,degenerate=0;
 const mountRay=new THREE.Raycaster(new THREE.Vector3(-1.475,.2,2.925),new THREE.Vector3(0,1,0),0,2.40);if(!mountRay.intersectObject(object,true).length)throw Error('Spindle gap '+index);
 object.traverse(o=>{if(o.isMesh){const g=o.geometry,p=g.attributes.position;triangles+=g.index.count/3;for(const attr of ['position','normal'])if(![...g.attributes[attr].array].every(Number.isFinite))throw Error('Nonfinite '+index);const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();for(let k=0;k<g.index.count;k+=3){a.fromBufferAttribute(p,g.index.array[k]);b.fromBufferAttribute(p,g.index.array[k+1]);c.fromBufferAttribute(p,g.index.array[k+2]);if(b.sub(a).cross(c.sub(a)).lengthSq()<1e-15)degenerate++;}}});
 for(let j=0;j<90;j++)for(let i=0;i<100;i++){const x=-2.1+(i+.5)/100*4.8,y=-1.3+(j+.5)/90*4.4,p=wallPoint({x,y});ray.set(EMITTER,p.clone().sub(EMITTER).normalize());ray.far=EMITTER.distanceTo(p)-.001;const blocked=ray.intersectObject(object,true).length>0,wanted=targetContains(x,y,index);if(blocked&&wanted)tp++;if(blocked&&!wanted)fp++;if(!blocked&&wanted)fn++;}
 const r={...object.userData,triangles,degenerate,IoU:tp/(tp+fp+fn),tp,fp,fn};results.push(r);console.log(r);if(r.IoU<.98||r.connectedComponents!==1||degenerate)throw Error('Geometry quality failure '+r.id);
 object.traverse(o=>{if(o.isMesh)o.geometry.dispose()});
}
fs.writeFileSync(new URL('../test-results/geometry.json',import.meta.url),JSON.stringify(results,null,2));
