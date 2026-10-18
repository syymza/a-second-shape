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
const plinth=roundedBase(.78,.12,baseMaterial,PIVOT.x,PIVOT.z);
const turntableRim=new THREE.InstancedMesh(new THREE.CylinderGeometry(.0035,.0035,.043,4),matte('#b9ad9b'),96);
const rimMatrix=new THREE.Matrix4();
for(let n=0;n<96;n++){const theta=n/96*Math.PI*2;rimMatrix.makeTranslation(Math.cos(theta)*.779,.046,Math.sin(theta)*.779);turntableRim.setMatrixAt(n,rimMatrix);}
turntableRim.position.set(PIVOT.x,0,PIVOT.z);turntableRim.receiveShadow=true;scene.add(turntableRim);
const stem=mesh(new THREE.CylinderGeometry(.016,.016,2.58,24),stemMaterial,[PIVOT.x,1.31,PIVOT.z]);
// The stand is a real object in the same light. Its quiet vertical shadow sits
// below the projected foot; it is not used to draw the animal itself.
stem.castShadow=true;

// A small physical projection lamp. The luminous lens is located at the
// exact optical emitter and the housing points along the actual spotlight.
const lamp=new THREE.Group();scene.add(lamp);
const lampBase=roundedBase(.35,.07,darkMaterial,EMITTER.x,EMITTER.z,lamp);
const lampStem=mesh(new THREE.CylinderGeometry(.028,.035,2.8,16),stemMaterial,[EMITTER.x,1.6,EMITTER.z],lamp);
const head=new THREE.Group();head.position.copy(EMITTER);head.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1),spot.target.position.clone().sub(EMITTER).normalize());lamp.add(head);
const body=mesh(new THREE.CylinderGeometry(.14,.23,.55,40,1,true),darkMaterial,[0,0,.22],head);body.rotation.x=Math.PI/2;
mesh(new THREE.CircleGeometry(.14,40),darkMaterial,[0,0,.495],head);
const rim=mesh(new THREE.TorusGeometry(.20,.018,20,96),stemMaterial,[0,0,-.06],head);
const lensMaterial=new THREE.MeshStandardMaterial({color:'#ffe7b3',emissive:'#ffdea0',emissiveIntensity:1.3,roughness:.4});
const lens=mesh(new THREE.CircleGeometry(.176,48),lensMaterial,[0,0,-.07],head);lens.rotation.y=Math.PI;lens.castShadow=false;
const cableCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(EMITTER.x,.045,EMITTER.z),new THREE.Vector3(EMITTER.x-.7,.025,EMITTER.z+.8),new THREE.Vector3(EMITTER.x-.6,.02,EMITTER.z+2.7)]);
mesh(new THREE.TubeGeometry(cableCurve,32,.012,6,false),darkMaterial,[0,0,0],lamp);

const START=THREE.MathUtils.degToRad(48),SNAP=THREE.MathUtils.degToRad(7);
// Keep the accumulated angle so regrabs never jump across a revolution.
const revealDistance=value=>Math.atan2(Math.sin(value),Math.cos(value));
let angle=START,targetAngle=START,drag=null,frame=0,width=0,height=0,found=false,frames=0,renderMs=[],contextLost=false,wheelDrag=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const turnCue=$('turn-cue');let turnCueStarted=false,turnCueDismissed=false,turnCueTimer=0;
function showTurnCue(){
  if(!turnCue||turnCueStarted||turnCueDismissed||document.hidden||!frames)return;
  turnCueStarted=true;turnCue.hidden=false;
  turnCueTimer=setTimeout(()=>dismissTurnCue(false),3200);
}
function dismissTurnCue(immediate=true){
  turnCueDismissed=true;clearTimeout(turnCueTimer);turnCueTimer=0;
  if(!turnCue)return;
  if(immediate||reduced.matches){turnCue.hidden=true;return;}
  turnCue.classList.add('leaving');
  turnCueTimer=setTimeout(()=>{turnCue.hidden=true;turnCueTimer=0;},350);
}
function positionRotationControl(){
  const control=wheel?.parentElement;if(!control||!width||!height)return;
  plinth.updateWorldMatrix(true,false);
  const bounds=new THREE.Box3().setFromObject(plinth),points=[];
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])points.push(new THREE.Vector3(x,y,z).project(camera));
  const left=(Math.min(...points.map(p=>p.x))+1)*width/2,right=(Math.max(...points.map(p=>p.x))+1)*width/2;
  const top=(1-Math.max(...points.map(p=>p.y)))*height/2,bottom=(1-Math.min(...points.map(p=>p.y)))*height/2;
  control.style.left=((left+right)/2)+'px';control.style.top=((top+bottom)/2-22)+'px';
  wheel.style.width=Math.max(88,right-left+12)+'px';
}
function positionTurnCue(){
  if(!turnCue)return;
  const point=PIVOT.clone().project(camera);
  turnCue.style.left=Math.max(56,Math.min(width-56,(point.x+1)*width/2))+'px';
  const offset=Math.max(55,Math.min(110,width/(camera.right-camera.left)*.8+13));
  turnCue.style.top=Math.max(100,Math.min(height-120,(1-point.y)*height/2+offset))+'px';
}
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(turnCueStarted)dismissTurnCue();}else showTurnCue();});

function draw(){if(contextLost)return;sculpture.rotation.y=angle;turntableRim.rotation.y=angle;const t=performance.now();renderer.render(scene,camera);renderMs.push(performance.now()-t);if(renderMs.length>400)renderMs.shift();frames++;updateWheel();showTurnCue();}
function invalidate(){if(!frame&&!contextLost)frame=requestAnimationFrame(tick);}
function tick(){frame=0;const d=targetAngle-angle;angle+=d*(reduced.matches?1:.24);if(Math.abs(d)<.0001)angle=targetAngle;draw();if(Math.abs(targetAngle-angle)>.0001)invalidate();}
function message(){if(!found&&Math.abs(revealDistance(angle))<.02){found=true;status.textContent='The shadow has come together. '+collection[currentIndex].name+'.';}}
function settleRotation(){
  if(Math.abs(revealDistance(angle))>=SNAP)return;
  targetAngle=angle-revealDistance(angle);if(reduced.matches)angle=targetAngle;invalidate();
  if(!found){found=true;status.textContent='The shadow has come together. '+collection[currentIndex].name+'.';}
}
function endDrag(e){
  if(!drag||e?.pointerId!==undefined&&e.pointerId!==drag.id)return;
  const d=drag;drag=null;canvas.classList.remove('dragging');
  if(canvas.hasPointerCapture(d.id))canvas.releasePointerCapture(d.id);
  if(e?.type==='pointerup')settleRotation();
}
canvas.addEventListener('pointerdown',e=>{if(drag||wheelDrag||dialDrag||transitioning||e.button>0)return;dismissTurnCue();e.preventDefault();canvas.classList.add('pointer-focus');canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,start:angle};targetAngle=angle;canvas.classList.add('dragging');});
canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();angle=drag.start+(e.clientX-drag.x)*.008;targetAngle=angle;invalidate();});
for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,endDrag);
window.addEventListener('blur',()=>endDrag());document.addEventListener('visibilitychange',()=>{if(document.hidden)endDrag();});
canvas.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','Escape'].includes(e.key))dismissTurnCue();canvas.classList.remove('pointer-focus');if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();angle=angle+(e.key==='ArrowLeft'?-1:1)*Math.PI/60;targetAngle=angle;if(Math.abs(revealDistance(angle))<.001)message();invalidate();}if(e.key==='Escape')endDrag();if(e.key==='Home'){e.preventDefault();reset();}});
function reset(){endDrag();endWheel();angle=targetAngle=START;found=false;status.textContent='The sculpture is ready to discover again.';invalidate();}
let desiredIndex=currentIndex,transitioning=false,fade=null,dialDrag=null,selectorAngle=0;
const dial=$('dial'),wheel=$('turn-wheel'),detent=Math.PI*2/collection.length;
function updateWheel(){
  if(!wheel)return;
  const degrees=((Math.round(THREE.MathUtils.radToDeg(angle))%360)+360)%360;
  wheel.setAttribute('aria-valuenow',String(degrees));wheel.setAttribute('aria-valuetext',degrees+' degrees');
}
function updateDial(preview=0){
  if(!dial)return;
  dial.setAttribute('aria-valuenow',String(desiredIndex+1));dial.setAttribute('aria-valuetext','Scene '+(desiredIndex+1)+' of '+collection.length);
  dial.style.setProperty('--scene-angle',(selectorAngle+preview)+'deg');
  dial.querySelectorAll('.selector-tick').forEach((tick,index)=>tick.classList.toggle('active',index===desiredIndex));
}
function rotateStep(direction,amount=3){
  if(transitioning)return;endDrag();endWheel();dismissTurnCue();
  angle+=THREE.MathUtils.degToRad(direction*amount);targetAngle=angle;
  if(Math.abs(revealDistance(angle))<.001)message();updateWheel();invalidate();
}
function endWheel(e){
  if(!wheelDrag||e?.pointerId!==undefined&&e.pointerId!==wheelDrag.id)return;
  const d=wheelDrag;wheelDrag=null;wheel.classList.remove('dragging');
  if(wheel.hasPointerCapture(d.id))wheel.releasePointerCapture(d.id);
  if(e?.type==='pointerup'){
    if(!d.moved){angle+=THREE.MathUtils.degToRad(d.side*12);targetAngle=angle;if(Math.abs(revealDistance(angle))<.001)message();invalidate();}
    else settleRotation();
  }
  updateWheel();
}
if(wheel){
 wheel.addEventListener('pointerdown',e=>{
  if(wheelDrag||drag||dialDrag||transitioning||e.button>0)return;e.preventDefault();dismissTurnCue();
  wheel.classList.add('pointer-focus','dragging');wheel.focus({preventScroll:true});wheel.setPointerCapture(e.pointerId);
  const box=wheel.getBoundingClientRect();wheelDrag={id:e.pointerId,x:e.clientX,start:angle,moved:false,side:e.clientX<box.x+box.width/2?-1:1};targetAngle=angle;
 });
 wheel.addEventListener('pointermove',e=>{if(!wheelDrag||wheelDrag.id!==e.pointerId)return;e.preventDefault();const dx=e.clientX-wheelDrag.x;if(Math.abs(dx)>4)wheelDrag.moved=true;if(wheelDrag.moved){angle=wheelDrag.start+dx*.012;targetAngle=angle;invalidate();}});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])wheel.addEventListener(event,endWheel);
 wheel.addEventListener('keydown',e=>{wheel.classList.remove('pointer-focus');if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();rotateStep(['ArrowRight','ArrowUp'].includes(e.key)?1:-1);}if(e.key==='Home'){e.preventDefault();reset();}if(e.key==='Escape')endWheel();});
}
if($('rotate-left'))$('rotate-left').onclick=()=>rotateStep(-1,12);
if($('rotate-right'))$('rotate-right').onclick=()=>rotateStep(1,12);
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
  dismissTurnCue();
  desiredIndex=((desiredIndex+step)%collection.length+collection.length)%collection.length;selectorAngle+=step*360/collection.length;updateDial();endDrag();endWheel();
  if(transitioning)return;
  if(currentIndex===desiredIndex)return;
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
  const d=dialDrag;dialDrag=null;dial.classList.remove('dragging');
  if(dial.hasPointerCapture(d.id))dial.releasePointerCapture(d.id);
  if(e?.type==='pointerup'&&!d.moved){
    if(d.radius<10)changeSculpture(1);
    else{const index=((Math.round((d.theta+Math.PI/2)/detent)%collection.length)+collection.length)%collection.length;let step=(index-desiredIndex+collection.length)%collection.length;if(step>collection.length/2)step-=collection.length;changeSculpture(step);}
  }
  updateDial();
}
dial.addEventListener('pointerdown',e=>{
  if(dialDrag||drag||wheelDrag||e.button>0)return;e.preventDefault();dismissTurnCue();
  dial.classList.add('pointer-focus','dragging');dial.focus({preventScroll:true});dial.setPointerCapture(e.pointerId);
  const box=dial.getBoundingClientRect(),cx=box.x+box.width/2,cy=box.y+box.height/2,dx=e.clientX-cx,dy=e.clientY-cy,radius=Math.hypot(dx,dy),theta=Math.atan2(dy,dx);
  dialDrag={id:e.pointerId,x:e.clientX,y:e.clientY,cx,cy,radius,theta,lastTheta:radius<10?null:theta,remainder:0,moved:false};
});
dial.addEventListener('pointermove',e=>{
  if(!dialDrag||dialDrag.id!==e.pointerId)return;e.preventDefault();const d=dialDrag;
  if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>4)d.moved=true;
  const dx=e.clientX-d.cx,dy=e.clientY-d.cy;
  if(Math.hypot(dx,dy)<8){d.lastTheta=null;return;}
  const theta=Math.atan2(dy,dx);
  if(d.lastTheta!==null){d.remainder+=Math.atan2(Math.sin(theta-d.lastTheta),Math.cos(theta-d.lastTheta));const steps=Math.trunc((d.remainder+Math.sign(d.remainder)*detent/2)/detent);if(steps){d.remainder-=steps*detent;changeSculpture(steps);}}
  d.lastTheta=theta;updateDial(THREE.MathUtils.radToDeg(d.remainder));
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])dial.addEventListener(event,endDial);
dial.addEventListener('keydown',e=>{
  dial.classList.remove('pointer-focus');
  if(['ArrowRight','ArrowUp','ArrowLeft','ArrowDown','Enter',' '].includes(e.key)){e.preventDefault();endDial();changeSculpture(['ArrowLeft','ArrowDown'].includes(e.key)?-1:1);}
  if(e.key==='Escape')endDial();
});
function cancelControls(){endWheel();endDial();}
window.addEventListener('blur',cancelControls);window.addEventListener('resize',cancelControls);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelControls();});
updateDial();
reduced.addEventListener('change',()=>{if(reduced.matches)fade?.finish();});
function lampScreenBounds(){
  lamp.updateWorldMatrix(true,true);
  const bounds=new THREE.Box3().expandByObject(lampBase).expandByObject(lampStem).expandByObject(head);
  const points=[];
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])points.push(new THREE.Vector3(x,y,z).project(camera));
  return {left:(Math.min(...points.map(p=>p.x))+1)*width/2,right:(Math.max(...points.map(p=>p.x))+1)*width/2,top:(1-Math.max(...points.map(p=>p.y)))*height/2,bottom:(1-Math.min(...points.map(p=>p.y)))*height/2};
}
function resize(){
  endDrag();const r=canvas.getBoundingClientRect();width=r.width;height=r.height;
  renderer.setSize(width,height,false);
  const aspect=width/height,portrait=aspect<.85,view=(portrait?9.1:Math.max(12.0,8.8*aspect))*(height<360?1.22:1);
  if(portrait){camera.position.set(4.5,9,20);camera.lookAt(-.7,height<650?1.7:1.1,2.6);}
  else{camera.position.set(4.5,6.5,17);camera.lookAt(-1.1,2.2,2);}
  camera.left=-view/2;camera.right=view/2;camera.top=view/aspect/2;camera.bottom=-camera.top;
  camera.updateProjectionMatrix();camera.updateMatrixWorld();
  // Translate the view, never the lamp or sculpture, to protect a CSS-sized gutter.
  if(portrait){
    const gutter=Math.max(18,Math.min(26,width*.065)),missing=gutter-lampScreenBounds().left;
    if(missing>0){const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0);camera.position.addScaledVector(right,-missing*view/width);camera.updateMatrixWorld();}
  }
  if(height<500){
    const up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1);
    camera.position.addScaledVector(up,-70*view/width);
    const back=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,2);
    camera.position.addScaledVector(back,10);camera.updateMatrixWorld();
  }
  positionRotationControl();positionTurnCue();invalidate();
}
window.addEventListener('resize',resize);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();endDrag();cancelControls();dismissTurnCue();contextLost=true;if(frame)cancelAnimationFrame(frame);frame=0;document.body.classList.add('failed');$('fallback').hidden=false;});canvas.addEventListener('webglcontextrestored',()=>{contextLost=false;document.body.classList.remove('failed');$('fallback').hidden=true;invalidate();});
resize();
window.shadowStudy={get state(){return {ready:frames>0,desiredIndex,transitioning,dialDragging:!!dialDrag,wheelDragging:!!wheelDrag,currentIndex,count:collection.length,loads,disposedGeometries,memory:{...renderer.info.memory},angle:THREE.MathUtils.radToDeg(angle),target:THREE.MathUtils.radToDeg(targetAngle),dragging:!!drag,found,frames,renderMs:[...renderMs],triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,pixelRatio:renderer.getPixelRatio(),...sculpture.userData};}};
// Exported for a separate local QA harness, never exposed as artwork controls.
export const inspection={scene,camera,get sculpture(){return sculpture;},spot,wall,floor,renderer,draw,plinth,targetBounds,EMITTER,PIVOT,lampScreenBounds};
