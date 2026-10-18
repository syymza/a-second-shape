import * as THREE from './vendor/three.module.js';
import {getDesign,surface} from './collection.js';

export const EMITTER = new THREE.Vector3(-3.4,3.0,6.5);
export const PIVOT = new THREE.Vector3(-1.475,2.61,2.925);
export const TARGET = {x:.10,y:1.75,scale:1.10};

export function targetContains(x,y,index=0){return getDesign(index).contains(x,y);}
export function wallPoint(p){return new THREE.Vector3(TARGET.x+p.x*TARGET.scale,TARGET.y+p.y*TARGET.scale,0);}
function alongRay(p,t){return EMITTER.clone().lerp(wallPoint(p),t).sub(PIVOT);}

function clip(poly,nx,ny,c){
  const output=[];
  for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],da=a.x*nx+a.y*ny-c,db=b.x*nx+b.y*ny-c;
    if(da<=1e-9)output.push(a);
    if((da<0)!==(db<0)){const t=da/(da-db);output.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});}
  }
  return output;
}
function finishSupport(g){
 const p=g.attributes.position,indices=g.index.array,clean=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
 for(let i=0;i<indices.length;i+=3){a.fromBufferAttribute(p,indices[i]);b.fromBufferAttribute(p,indices[i+1]);c.fromBufferAttribute(p,indices[i+2]);if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-15)clean.push(indices[i],indices[i+1],indices[i+2]);}
 g.setIndex(clean);g.computeVertexNormals();
}

function polygonParts(polygons){
 const parent=polygons.map((_,i)=>i),lookup=new Map(),root=i=>parent[i]===i?i:parent[i]=root(parent[i]);
 polygons.forEach((poly,i)=>{for(const p of poly){const key=p.x.toFixed(6)+','+p.y.toFixed(6);if(lookup.has(key))parent[root(i)]=root(lookup.get(key));else lookup.set(key,i);}});
 const parts=new Map();polygons.forEach((poly,i)=>{const key=root(i);if(!parts.has(key))parts.set(key,[]);parts.get(key).push(poly);});return [...parts.values()];
}
function inPolygon(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++)if((poly[i].y>p.y)!==(poly[j].y>p.y)&&p.x<(poly[j].x-poly[i].x)*(p.y-poly[i].y)/(poly[j].y-poly[i].y)+poly[i].x)inside=!inside;return inside;}

export function makeSculpture(materials,index=0){
const d=getDesign(index),sites=d.regions,{triangles,flat}=d,THICKNESS=d.thickness;
const depth=(site,p)=>surface(d,site,p).t;
const targetContains=(x,y)=>d.contains(x,y);
function geometryFor(polygons,site){
  if(![site.x,site.y,site.depth].every(Number.isFinite))throw new Error('Invalid fragment surface parameters');
  const points=[],faces=[],lookup=new Map();
  function vertex(p){const key=p.x.toFixed(7)+','+p.y.toFixed(7);if(!lookup.has(key)){lookup.set(key,points.length);points.push(p);}return lookup.get(key);}
  function addTriangle(a,b,c,level){
    if(level){const ab={x:(a.x+b.x)/2,y:(a.y+b.y)/2},bc={x:(b.x+c.x)/2,y:(b.y+c.y)/2},ca={x:(c.x+a.x)/2,y:(c.y+a.y)/2};addTriangle(a,ab,ca,level-1);addTriangle(ab,b,bc,level-1);addTriangle(ca,bc,c,level-1);addTriangle(ab,bc,ca,level-1);return;}
    const cross=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
    if(Math.abs(cross)<1e-12)return;
    if(cross>0)faces.push(vertex(a),vertex(b),vertex(c));else faces.push(vertex(c),vertex(b),vertex(a));
  }
  for(const p of polygons)for(let i=1;i<p.length-1;i++){
    addTriangle(p[0],p[i],p[i+1],2);
  }
  const n=points.length,positions=[],uv=[],index=[...faces],targets=[],layers=[];
  function push(p,back){positions.push(...alongRay(p,surface(d,site,p,back).t).toArray());uv.push(p.x*.7,p.y*.7);targets.push(p);layers.push(back?1:0);}
  for(const back of [false,true])for(const p of points)push(p,back);
  for(let i=0;i<faces.length;i+=3)index.push(faces[i+2]+n,faces[i+1]+n,faces[i]+n);
  // Derive the shell perimeter before subdividing the cap. Keeping the rim
  // separate avoids artificial internal walls and contaminated cap normals.
  const edges=new Map(),key=p=>p.x.toFixed(7)+','+p.y.toFixed(7);
  for(const polygon of polygons)for(let i=0;i<polygon.length;i++){
    const a=polygon[i],b=polygon[(i+1)%polygon.length],ka=key(a),kb=key(b);if(ka===kb)continue;
    const k=ka<kb?ka+'|'+kb:kb+'|'+ka;if(edges.has(k))edges.delete(k);else edges.set(k,[a,b]);
  }
  const boundaries=[...edges.values()];
  for(const [a,b] of boundaries)for(let j=0;j<4;j++){
    const p={x:a.x+(b.x-a.x)*j/4,y:a.y+(b.y-a.y)*j/4},q={x:a.x+(b.x-a.x)*(j+1)/4,y:a.y+(b.y-a.y)*(j+1)/4},k=positions.length/3;
    push(p,false);push(q,false);push(p,true);push(q,true);index.push(k,k+2,k+1,k+1,k+2,k+3);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  // Reject faces that collapse after conversion to the GPU's Float32 format.
  const position=g.attributes.position,clean=[],a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  for(let i=0;i<index.length;i+=3){a.fromBufferAttribute(position,index[i]);b.fromBufferAttribute(position,index[i+1]);c.fromBufferAttribute(position,index[i+2]);if(b.sub(a).cross(c.sub(a)).lengthSq()>1e-15)clean.push(index[i],index[i+1],index[i+2]);}
  g.setIndex(clean);g.computeVertexNormals();
  // Analytic normals avoid the bias of skinny clipped triangles at the rim.
  const normal=g.attributes.normal;
  for(let i=0;i<2*n;i++){
    const p=targets[i],s=surface(d,site,p,!!layers[i]),t=s.t;
    const delta=wallPoint(p).sub(EMITTER),tx=s.dx,ty=s.dy;
    const fx=delta.clone().multiplyScalar(tx).add(new THREE.Vector3(t*TARGET.scale,0,0));
    const fy=delta.clone().multiplyScalar(ty).add(new THREE.Vector3(0,t*TARGET.scale,0));
    const v=fx.cross(fy).normalize().multiplyScalar(layers[i]?-1:1);normal.setXYZ(i,v.x,v.y,v.z);
  }
  return {g,boundaries,points,targets,layers};
}

  const sculpture=new THREE.Group();sculpture.position.copy(PIVOT);
  const patches=[];
  for(const site of sites){
    const polygons=[];
    for(const tri of triangles){
      let p=tri.map(i=>flat[i]);
      for(const [nx,ny,c] of site.cuts){p=clip(p,nx,ny,c);if(p.length<3)break;}
      if(p.length>=3)polygons.push(p);
    }
    if(!polygons.length)continue;
    const {g,boundaries,points}=geometryFor(polygons,site);
    const m=new THREE.Mesh(g,materials[site.i%materials.length]);m.castShadow=m.receiveShadow=true;m.userData={patch:site.i};sculpture.add(m);
    for(const part of polygonParts(polygons)){
      const keys=new Set(part.flat().map(p=>p.x.toFixed(7)+','+p.y.toFixed(7)));
      const edges=boundaries.filter(([a,b])=>keys.has(a.x.toFixed(7)+','+a.y.toFixed(7))&&keys.has(b.x.toFixed(7)+','+b.y.toFixed(7)));
      patches.push({site,boundaries:edges,polygons:part,key:patches.length});
    }
  }
  // Slender joins sit along shared projection rays, inside the projected footprint.
  // They physically link depth-separated patches without painting a shadow.
  const edges=new Map();
  for(const patch of patches)for(const[a,b]of patch.boundaries){
    const ka=a.x.toFixed(5)+','+a.y.toFixed(5),kb=b.x.toFixed(5)+','+b.y.toFixed(5),key=ka<kb?ka+'|'+kb:kb+'|'+ka;
    if(!edges.has(key))edges.set(key,[]);edges.get(key).push({patch,a,b});
  }
  let connectors=0;const linked=new Map(),candidates=[];
  for(const patch of patches)linked.set(patch.key,patch.key);
  const root=i=>linked.get(i)===i?i:root(linked.get(i));
  for(const entries of edges.values()){
    if(entries.length!==2||entries[0].patch===entries[1].patch)continue;
    const {a,b}=entries[0],length=Math.hypot(b.x-a.x,b.y-a.y);if(length<(index===0?.012:.002))continue;
    const p={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    const radius=(index===0?[.016]:[.010,.006,.003,.001]).find(r=>Array.from({length:12},(_,i)=>targetContains(p.x+r*Math.cos(i*Math.PI/6),p.y+r*Math.sin(i*Math.PI/6))).every(Boolean));
    if(!radius)continue;
    const aa=depth(entries[0].patch.site,p),bb=depth(entries[1].patch.site,p);
    candidates.push({entries,p,radius,aa,bb,cost:Math.abs(aa-bb)});
  }
  candidates.sort((a,b)=>a.cost-b.cost);
  for(const {entries,p,radius,aa,bb} of candidates){
    const first=root(entries[0].patch.key),second=root(entries[1].patch.key);if(first===second)continue;linked.set(first,second);
    const pts=Array.from({length:12},(_,i)=>({x:p.x+radius*Math.cos(i*Math.PI/6),y:p.y+radius*Math.sin(i*Math.PI/6)}));
    const geom=geometryFor([pts],{i:0,depth:.55,x:p.x,y:p.y});
    // The connector is a small ray-tapered solid with two fixed depth caps.
    const g=geom.g,position=g.attributes.position;
    for(let i=0;i<position.count;i++){const v=geom.targets[i],back=geom.layers[i];position.setXYZ(i,...alongRay(v,(back?Math.max(aa,bb):Math.min(aa,bb))+(back?THICKNESS+.005:-.005)).toArray());}
    position.needsUpdate=true;finishSupport(g);
    const join=new THREE.Mesh(g,materials[materials.length-1]);join.castShadow=join.receiveShadow=true;join.userData={connector:true};sculpture.add(join);connectors++;
  }
  // Mount the connected cluster to its vertical turning spindle. This join
  // follows the same projection ray through an interior part of the body.
  const anchorPoint={x:0,y:((EMITTER.y+(PIVOT.y-EMITTER.y)/.55)-TARGET.y)/TARGET.scale};
  const owner=patches.find(p=>p.polygons.some(poly=>inPolygon(anchorPoint,poly)));
  if(!owner||!targetContains(anchorPoint.x,anchorPoint.y))throw new Error(`Invalid spindle attachment for ${d.id}`);
  const anchorDepth=depth(owner.site,anchorPoint)+THICKNESS/2;
  const ring=Array.from({length:12},(_,i)=>({x:anchorPoint.x+.035*Math.cos(i*Math.PI/6),y:anchorPoint.y+.035*Math.sin(i*Math.PI/6)}));
  const anchor=geometryFor([ring],{i:0,depth:.55,x:anchorPoint.x,y:anchorPoint.y});
  const anchorPosition=anchor.g.attributes.position;
  for(let i=0;i<anchorPosition.count;i++)anchorPosition.setXYZ(i,...alongRay(anchor.targets[i],anchor.layers[i]?Math.max(anchorDepth,.55)+.004:Math.min(anchorDepth,.55)-.004).toArray());
  anchorPosition.needsUpdate=true;finishSupport(anchor.g);
  const mount=new THREE.Mesh(anchor.g,materials[materials.length-1]);mount.castShadow=mount.receiveShadow=true;mount.userData={axisAnchor:true};sculpture.add(mount);
  sculpture.userData={index,id:d.id,name:d.name,construction:d.construction,regions:sites.length,patches:patches.length,connectors,axisAnchor:true,connectedComponents:new Set(patches.map(p=>root(p.key))).size};
  return sculpture;
}

export const targetBounds={left:TARGET.x-2.1*TARGET.scale,right:TARGET.x+2.7*TARGET.scale,bottom:TARGET.y-1.3*TARGET.scale,top:TARGET.y+3.1*TARGET.scale};
