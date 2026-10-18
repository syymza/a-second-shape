import * as THREE from './vendor/three.module.js';
import {collection} from './collection.js';
import {makeSculpture,EMITTER,PIVOT,targetBounds} from './sculpture.js';

const $=id=>document.getElementById(id),canvas=$('art'),status=$('status');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});}catch(error){document.body.classList.add('failed');$('fallback').hidden=false;throw error;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
const scene=new THREE.Scene();scene.background=new THREE.Color('#e6e0d7');
const camera=new THREE.OrthographicCamera(-6,6,4,-4,.1,70);camera.position.set(2.0,6.5,17);camera.lookAt(-.65,2.2,2);
const ambient=new THREE.HemisphereLight('#fffaf1','#cbc2b4',1.0);ambient.position.set(0,10,0);scene.add(ambient);
const spot=new THREE.SpotLight('#fff4e5',210,24,.57,.55,2);spot.position.copy(EMITTER);spot.target.position.set(.10,2.6,0);spot.castShadow=true;
spot.shadow.mapSize.set(2048,2048);spot.shadow.camera.near=.5;spot.shadow.camera.far=20;spot.shadow.bias=-.00008;spot.shadow.normalBias=.007;spot.shadow.focus=1;scene.add(spot,spot.target);
const fill=new THREE.DirectionalLight('#fffdf7',.85);fill.position.set(3,7,9);scene.add(fill);

let seed=4875;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
const c=document.createElement('canvas');c.width=c.height=256;const context=c.getContext('2d'),pixels=context.createImageData(256,256);
for(let i=0;i<pixels.data.length;i+=4){const v=235+random()*20;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}context.putImageData(pixels,0,0);
const grain=new THREE.CanvasTexture(c);grain.wrapS=grain.wrapT=THREE.RepeatWrapping;grain.repeat.set(3,3);
function matte(color,roughness=.98){return new THREE.MeshStandardMaterial({color,roughness,metalness:0,map:grain,bumpMap:grain,bumpScale:.001});}
const plaster=['#e1d8c9','#e3dacd','#dfd6c8','#e2d9cc','#ddd4c6','#d9d0c2'].map(v=>matte(v));
let currentIndex=0,loads=1,disposedGeometries=0;
let sculpture=makeSculpture(plaster);scene.add(sculpture);
const wallMaterial=matte('#eee8de');wallMaterial.bumpScale=.002;const roomGrain=grain.clone();roomGrain.repeat.set(72,36);roomGrain.needsUpdate=true;wallMaterial.map=wallMaterial.bumpMap=roomGrain;
const wall=new THREE.Mesh(new THREE.PlaneGeometry(30,15),wallMaterial);wall.position.set(0,5,-.012);wall.receiveShadow=true;scene.add(wall);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),matte('#d9d0c3'));floor.rotation.x=-Math.PI/2;floor.position.set(0,-.015,2);floor.material.map=floor.material.bumpMap=roomGrain;floor.receiveShadow=true;scene.add(floor);

function mesh(g,m,p,parent=scene){const o=new THREE.Mesh(g,m);o.position.set(...p);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
const baseMaterial=matte('#d6cabb'),darkMaterial=matte('#a69a8a'),stemMaterial=new THREE.MeshStandardMaterial({color:'#a79b89',roughness:.7,metalness:.3});
function roundedBase(radius,height,material,x,z,parent=scene){
  const profile=[[0,0],[.85,0],[.91,.015],[.96,.08],[.99,.22],[1,.40],[.995,.60],[.98,.78],[.94,.92],[.88,1],[0,1]].map(([r,y])=>new THREE.Vector2(r*radius,y*height));
  return mesh(new THREE.LatheGeometry(profile,128),material,[x,.005,z],parent);
}
const plinth=roundedBase(.78,.085,baseMaterial,PIVOT.x,PIVOT.z);
const stem=mesh(new THREE.CylinderGeometry(.016,.016,2.58,24),stemMaterial,[PIVOT.x,1.31,PIVOT.z]);
// The stand is a real object in the same light. Its quiet vertical shadow sits
// below the projected foot; it is not used to draw the animal itself.
stem.castShadow=true;

// A small physical projection lamp. The luminous lens is located at the
// exact optical emitter and the housing points along the actual spotlight.
const lamp=new THREE.Group();scene.add(lamp);
roundedBase(.35,.07,darkMaterial,EMITTER.x,EMITTER.z,lamp);
mesh(new THREE.CylinderGeometry(.028,.035,2.8,16),stemMaterial,[EMITTER.x,1.6,EMITTER.z],lamp);
const head=new THREE.Group();head.position.copy(EMITTER);head.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1),spot.target.position.clone().sub(EMITTER).normalize());lamp.add(head);
const body=mesh(new THREE.CylinderGeometry(.14,.23,.55,40,1,true),darkMaterial,[0,0,.22],head);body.rotation.x=Math.PI/2;
mesh(new THREE.CircleGeometry(.14,40),darkMaterial,[0,0,.495],head);
const rim=mesh(new THREE.TorusGeometry(.20,.018,20,96),stemMaterial,[0,0,-.06],head);
const lensMaterial=new THREE.MeshStandardMaterial({color:'#ffe7b3',emissive:'#ffdea0',emissiveIntensity:1.3,roughness:.4});
const lens=mesh(new THREE.CircleGeometry(.176,48),lensMaterial,[0,0,-.07],head);lens.rotation.y=Math.PI;lens.castShadow=false;
const cableCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(EMITTER.x,.045,EMITTER.z),new THREE.Vector3(EMITTER.x-.7,.025,EMITTER.z+.8),new THREE.Vector3(EMITTER.x-.6,.02,EMITTER.z+2.7)]);
mesh(new THREE.TubeGeometry(cableCurve,32,.012,6,false),darkMaterial,[0,0,0],lamp);

const START=THREE.MathUtils.degToRad(48),LIMIT=THREE.MathUtils.degToRad(115),SNAP=THREE.MathUtils.degToRad(7);
let angle=START,targetAngle=START,drag=null,frame=0,width=0,height=0,found=false,frames=0,renderMs=[],contextLost=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function draw(){if(contextLost)return;sculpture.rotation.y=angle;const t=performance.now();renderer.render(scene,camera);renderMs.push(performance.now()-t);if(renderMs.length>400)renderMs.shift();frames++;}
function invalidate(){if(!frame&&!contextLost)frame=requestAnimationFrame(tick);}
function tick(){frame=0;const d=targetAngle-angle;angle+=d*(reduced.matches?1:.24);if(Math.abs(d)<.0001)angle=targetAngle;draw();if(Math.abs(targetAngle-angle)>.0001)invalidate();}
function message(){if(!found&&Math.abs(angle)<.02){found=true;$('hint').textContent='There it is.';const caption=document.createElement('span');caption.textContent=collection[currentIndex].name+', held in the light.';$('hint').append(caption);status.textContent='The shadow has come together. '+collection[currentIndex].name+'.';}}
function endDrag(e){if(!drag||e?.pointerId!==undefined&&e.pointerId!==drag.id)return;const d=drag;drag=null;canvas.classList.remove('dragging');if(canvas.hasPointerCapture(d.id))canvas.releasePointerCapture(d.id);if(Math.abs(angle)<SNAP){targetAngle=0;if(reduced.matches)angle=0;invalidate();if(!found){found=true;$('hint').textContent='There it is.';const caption=document.createElement('span');caption.textContent=collection[currentIndex].name+', held in the light.';$('hint').append(caption);status.textContent='The shadow has come together. '+collection[currentIndex].name+'.';}}}
canvas.addEventListener('pointerdown',e=>{if(drag||transitioning||e.button>0)return;e.preventDefault();canvas.classList.add('pointer-focus');canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,start:angle};targetAngle=angle;canvas.classList.add('dragging');});
canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();angle=THREE.MathUtils.clamp(drag.start+(e.clientX-drag.x)*.008,-LIMIT,LIMIT);targetAngle=angle;invalidate();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,endDrag);
window.addEventListener('blur',()=>endDrag());document.addEventListener('visibilitychange',()=>{if(document.hidden)endDrag();});
canvas.addEventListener('keydown',e=>{canvas.classList.remove('pointer-focus');if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();angle=THREE.MathUtils.clamp(angle+(e.key==='ArrowLeft'?-1:1)*Math.PI/60,-LIMIT,LIMIT);targetAngle=angle;if(Math.abs(angle)<.001)message();invalidate();}if(e.key==='Escape')endDrag();if(e.key==='Home'){e.preventDefault();reset();}});
function reset(){endDrag();angle=targetAngle=START;found=false;$('hint').innerHTML='Turn it slowly.<span>There is more than one way to see.</span>';status.textContent='The sculpture is ready to discover again.';invalidate();}
$('reset').onclick=reset;
let desiredIndex=currentIndex,transitioning=false,fade=null,dialDrag=null;
const dial=$('dial'),detent=42;
function updateDial(){dial.setAttribute('aria-valuenow',String(currentIndex+1));dial.setAttribute('aria-valuetext','Sculpture '+(currentIndex+1));}
function swapSculpture(){
  if(currentIndex===desiredIndex)return;
  endDrag();if(frame)cancelAnimationFrame(frame);frame=0;
  const previous=sculpture;scene.remove(previous);
  previous.traverse(o=>{if(o.isMesh){o.geometry.dispose();disposedGeometries++;}});
  renderer.renderLists.dispose();currentIndex=desiredIndex;
  sculpture=makeSculpture(plaster,currentIndex);scene.add(sculpture);loads++;
  reset();updateDial();draw();status.textContent='Another sculpture, ready to discover.';
}
async function fadeTo(from,to,duration){
  if(reduced.matches)return;
  fade=canvas.animate([{opacity:from},{opacity:to}],{duration,easing:'ease-in-out',fill:'forwards'});
  await fade.finished.catch(()=>{});
}
async function changeSculpture(step){
  desiredIndex=((desiredIndex+step)%collection.length+collection.length)%collection.length;endDrag();
  if(transitioning)return;
  transitioning=true;
  try{
    do{
      await fadeTo(1,0,120);swapSculpture();
      await fadeTo(0,1,180);
    }while(currentIndex!==desiredIndex);
  }finally{fade?.cancel();fade=null;transitioning=false;}
}
$('next').onclick=()=>changeSculpture(1);
$('previous').onclick=()=>changeSculpture(-1);
function endDial(e){
  if(!dialDrag||e?.pointerId!==undefined&&e.pointerId!==dialDrag.id)return;
  const id=dialDrag.id;dialDrag=null;dial.classList.remove('dragging');
  dial.style.setProperty('--dial-shift','0px');
  if(dial.hasPointerCapture(id))dial.releasePointerCapture(id);
}
dial.addEventListener('pointerdown',e=>{
  if(dialDrag||e.button>0)return;e.preventDefault();endDrag();
  dial.classList.add('pointer-focus');dial.focus({preventScroll:true});dial.setPointerCapture(e.pointerId);
  dialDrag={id:e.pointerId,x:e.clientX,remainder:0};dial.classList.add('dragging');
});
dial.addEventListener('pointermove',e=>{
  if(!dialDrag||e.pointerId!==dialDrag.id)return;e.preventDefault();
  dialDrag.remainder+=e.clientX-dialDrag.x;dialDrag.x=e.clientX;
  const steps=Math.trunc(dialDrag.remainder/detent);
  if(steps){dialDrag.remainder-=steps*detent;changeSculpture(steps);}
  dial.style.setProperty('--dial-shift',(dialDrag.remainder*.4)+'px');
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])dial.addEventListener(event,endDial);
dial.addEventListener('keydown',e=>{
  dial.classList.remove('pointer-focus');
  if(['ArrowRight','ArrowUp','ArrowLeft','ArrowDown'].includes(e.key)){
    e.preventDefault();endDial();changeSculpture(['ArrowRight','ArrowUp'].includes(e.key)?1:-1);
  }
  if(e.key==='Escape')endDial();
});
window.addEventListener('blur',()=>endDial());
window.addEventListener('resize',()=>endDial());
document.addEventListener('visibilitychange',()=>{if(document.hidden)endDial();});
reduced.addEventListener('change',()=>{if(reduced.matches)fade?.finish();});
$('save').onclick=async()=>{const button=$('save');button.disabled=true;try{draw();const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('No image')),'image/png'));const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='a-second-shape-'+String(currentIndex+1).padStart(2,'0')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);status.textContent='Your study is saved as a PNG.';}catch(error){status.textContent='The image could not be saved. Please try again.';console.error(error);}finally{button.disabled=false;}};
function resize(){endDrag();const r=canvas.getBoundingClientRect();width=r.width;height=r.height;renderer.setSize(width,height,false);const aspect=width/height,view=aspect<.85?8.2:Math.max(12.0,8.8*aspect);if(aspect<.85){camera.position.set(4.5,9,20);camera.lookAt(-.7,height<650?1.7:1.1,2.6);}else{camera.position.set(4.5,6.5,17);camera.lookAt(-1.1,2.2,2);}camera.left=-view/2;camera.right=view/2;camera.top=view/aspect/2;camera.bottom=-camera.top;camera.updateProjectionMatrix();invalidate();}
window.addEventListener('resize',resize);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();endDrag();endDial();contextLost=true;if(frame)cancelAnimationFrame(frame);frame=0;document.body.classList.add('failed');$('fallback').hidden=false;});canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;document.body.classList.remove('failed');$('fallback').hidden=true;invalidate();});
resize();
window.shadowStudy={get state(){return {ready:frames>0,desiredIndex,transitioning,dialDragging:!!dialDrag,currentIndex,count:collection.length,loads,disposedGeometries,memory:{...renderer.info.memory},angle:THREE.MathUtils.radToDeg(angle),target:THREE.MathUtils.radToDeg(targetAngle),dragging:!!drag,found,frames,renderMs:[...renderMs],triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,pixelRatio:renderer.getPixelRatio(),...sculpture.userData};}};
// Exported for a separate local QA harness, never exposed as artwork controls.
export const inspection={scene,camera,get sculpture(){return sculpture;},spot,wall,floor,renderer,draw,targetBounds,EMITTER,PIVOT};
