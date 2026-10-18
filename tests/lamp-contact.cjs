const assert=require('node:assert/strict');
async function inspectLamp(page){
 return page.evaluate(async()=>{
  const THREE=await import('./vendor/three.module.js'),{scene,camera,EMITTER}=window.shadowStudy.inspection;
  scene.updateMatrixWorld(true);
  const lamp=scene.children.find(o=>o.isGroup&&o.children.some(c=>c.geometry?.parameters?.radiusTop===.028));
  if(!lamp)throw Error('Projection lamp not found');
  const stem=lamp.children.find(o=>o.geometry?.parameters?.radiusTop===.028),base=lamp.children.find(o=>o.geometry?.type==='LatheGeometry'),housing=lamp.children.find(o=>o.isGroup).children.find(o=>o.geometry?.parameters?.radiusTop===.14);
  const shaft=new THREE.Box3().setFromObject(stem),probeX=EMITTER.x+.01;
  const baseRay=new THREE.Raycaster(new THREE.Vector3(probeX,EMITTER.y+1,EMITTER.z),new THREE.Vector3(0,-1,0));
  const headRay=new THREE.Raycaster(new THREE.Vector3(probeX,.1,EMITTER.z),new THREE.Vector3(0,1,0));
  const baseHit=baseRay.intersectObject(base)[0],headHit=headRay.intersectObject(housing)[0];
  if(!baseHit||!headHit)throw Error('Lamp contact ray missed physical surface');
  const point=baseHit.point.clone().project(camera);
  return {stemBottom:shaft.min.y,stemTop:shaft.max.y,baseSurface:baseHit.point.y,housingSurface:headHit.point.y,baseOverlap:baseHit.point.y-shaft.min.y,headOverlap:shaft.max.y-headHit.point.y,baseContactScreen:{x:(point.x+1)*innerWidth/2,y:(1-point.y)*innerHeight/2}};
 });
}
async function assertLampContact(page){const r=await inspectLamp(page);assert(r.baseOverlap>=.01,'Lamp stem must enter base by at least .01 world units: '+JSON.stringify(r));assert(r.headOverlap>=.02,'Lamp stem must intersect head housing: '+JSON.stringify(r));assert(Object.values(r.baseContactScreen).every(Number.isFinite));return r;}
module.exports={inspectLamp,assertLampContact};
